import * as ort from "onnxruntime-web";
import wasmUrl from "../../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm?url";

ort.env.wasm.wasmPaths = {
  wasm: wasmUrl,
};
ort.env.wasm.numThreads = 1;

export type Detection = {
  classId: number;
  label: string;
  score: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type ModelInfo = {
  inputName: string;
  inputWidth: number;
  inputHeight: number;
};

type Letterbox = {
  scale: number;
  padX: number;
  padY: number;
  sourceWidth: number;
  sourceHeight: number;
};

type DetectOptions = {
  session: ort.InferenceSession;
  modelInfo: ModelInfo;
  source: CanvasImageSource;
  labels?: string[];
  confidenceThreshold: number;
  iouThreshold: number;
};

const MAX_NMS_CANDIDATES = 60;

type PreprocessCanvas = HTMLCanvasElement | OffscreenCanvas;
type PreprocessContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

let preprocessCanvas: PreprocessCanvas | null = null;
let preprocessCtx: PreprocessContext | null = null;
let preprocessData: Float32Array | null = null;

export async function createYoloSession(modelFile: File): Promise<{
  session: ort.InferenceSession;
  modelInfo: ModelInfo;
}> {
  const bytes = await modelFile.arrayBuffer();
  const session = await ort.InferenceSession.create(bytes, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
  const inputName = session.inputNames[0];

  if (!inputName) {
    throw new Error("The model does not expose an input tensor.");
  }

  const inputMetadata = session.inputMetadata as unknown as Record<
    string,
    { dimensions?: readonly (number | string | undefined)[] }
  >;
  const inputMeta = inputMetadata[inputName];
  const dims = inputMeta?.dimensions ?? [];
  const inputHeight = numberDimension(dims[2], 640);
  const inputWidth = numberDimension(dims[3], 640);

  return {
    session,
    modelInfo: {
      inputName,
      inputWidth,
      inputHeight,
    },
  };
}

export async function detectYolo({
  session,
  modelInfo,
  source,
  labels = [],
  confidenceThreshold,
  iouThreshold,
}: DetectOptions): Promise<Detection[]> {
  const { tensor, letterbox } = preprocess(source, modelInfo.inputWidth, modelInfo.inputHeight);
  const feeds: Record<string, ort.Tensor> = {
    [modelInfo.inputName]: tensor,
  };
  const results = await session.run(feeds);
  const outputName = session.outputNames[0];

  if (!outputName || !results[outputName]) {
    throw new Error("The model did not return an output tensor.");
  }

  const output = results[outputName];
  const detections = outputToDetections(output, labels, letterbox, confidenceThreshold);

  return nonMaxSuppression(detections, iouThreshold);
}

export function drawDetections(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  detections: Detection[],
): void {
  const ctx = canvas.getContext("2d");
  const sourceSize = getSourceSize(source);

  if (!ctx || !sourceSize.width || !sourceSize.height) {
    return;
  }

  canvas.width = sourceSize.width;
  canvas.height = sourceSize.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  drawDetectionBoxes(ctx, canvas, detections);
}

export function drawDetectionOverlay(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  detections: Detection[],
): void {
  const ctx = canvas.getContext("2d");
  const sourceSize = getSourceSize(source);

  if (!ctx || !sourceSize.width || !sourceSize.height) {
    return;
  }

  const targetWidth = Math.max(1, Math.round(canvas.clientWidth));
  const targetHeight = Math.max(1, Math.round(canvas.clientHeight));

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const renderScale = Math.min(canvas.width / sourceSize.width, canvas.height / sourceSize.height);
  const renderWidth = sourceSize.width * renderScale;
  const renderHeight = sourceSize.height * renderScale;
  const offsetX = (canvas.width - renderWidth) / 2;
  const offsetY = (canvas.height - renderHeight) / 2;
  drawDetectionBoxes(
    ctx,
    canvas,
    detections.map((detection) => ({
      ...detection,
      box: {
        x: offsetX + detection.box.x * renderScale,
        y: offsetY + detection.box.y * renderScale,
        width: detection.box.width * renderScale,
        height: detection.box.height * renderScale,
      },
    })),
  );
}

function drawDetectionBoxes(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  detections: Detection[],
): void {
  ctx.lineWidth = Math.max(2, Math.round(canvas.width / 360));
  ctx.font = `${Math.max(14, Math.round(canvas.width / 48))}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = "top";

  for (const detection of detections) {
    const color = classColor(detection.classId);
    const text = `${detection.label} ${(detection.score * 100).toFixed(0)}%`;
    const textWidth = ctx.measureText(text).width;
    const labelHeight = Math.max(20, Math.round(canvas.width / 32));
    const x = clamp(detection.box.x, 0, canvas.width);
    const y = clamp(detection.box.y, 0, canvas.height);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.strokeRect(x, y, detection.box.width, detection.box.height);
    ctx.fillRect(x, Math.max(0, y - labelHeight), textWidth + 12, labelHeight);
    ctx.fillStyle = "#071014";
    ctx.fillText(text, x + 6, Math.max(0, y - labelHeight) + 3);
  }
}

function preprocess(source: CanvasImageSource, inputWidth: number, inputHeight: number): {
  tensor: ort.Tensor;
  letterbox: Letterbox;
} {
  const sourceSize = getSourceSize(source);

  if (!sourceSize.width || !sourceSize.height) {
    throw new Error("The selected media is not ready yet.");
  }

  const scale = Math.min(inputWidth / sourceSize.width, inputHeight / sourceSize.height);
  const drawWidth = Math.round(sourceSize.width * scale);
  const drawHeight = Math.round(sourceSize.height * scale);
  const padX = Math.floor((inputWidth - drawWidth) / 2);
  const padY = Math.floor((inputHeight - drawHeight) / 2);
  const canvas = getPreprocessCanvas(inputWidth, inputHeight);
  const ctx = preprocessCtx;

  if (!ctx) {
    throw new Error("Could not prepare the image for inference.");
  }

  ctx.fillStyle = "rgb(114, 114, 114)";
  ctx.fillRect(0, 0, inputWidth, inputHeight);
  ctx.drawImage(source, padX, padY, drawWidth, drawHeight);

  const imageData = ctx.getImageData(0, 0, inputWidth, inputHeight).data;
  const data = getPreprocessData(inputWidth, inputHeight);
  const plane = inputWidth * inputHeight;

  for (let i = 0; i < inputWidth * inputHeight; i += 1) {
    const pixel = i * 4;
    data[i] = imageData[pixel] / 255;
    data[plane + i] = imageData[pixel + 1] / 255;
    data[plane * 2 + i] = imageData[pixel + 2] / 255;
  }

  return {
    tensor: new ort.Tensor("float32", data, [1, 3, inputHeight, inputWidth]),
    letterbox: {
      scale,
      padX,
      padY,
      sourceWidth: sourceSize.width,
      sourceHeight: sourceSize.height,
    },
  };
}

function outputToDetections(
  output: ort.Tensor,
  labels: string[],
  letterbox: Letterbox,
  confidenceThreshold: number,
): Detection[] {
  const dims = output.dims;
  const values = output.data as Float32Array | number[];

  if (dims.length !== 3) {
    throw new Error(`Unsupported YOLO output rank ${dims.length}. Expected a 3D output tensor.`);
  }

  const first = dims[1];
  const second = dims[2];

  if (second >= 5 && first > second) {
    return rowMajorOutputToDetections(values, first, second, labels, letterbox, confidenceThreshold);
  }

  if (first >= 5 && second > first) {
    return columnMajorOutputToDetections(values, first, second, labels, letterbox, confidenceThreshold);
  }

  const features = Math.max(5, labels.length + 5);
  return rowMajorOutputToDetections(values, Math.floor(values.length / features), features, labels, letterbox, confidenceThreshold);
}

function rowMajorOutputToDetections(
  values: Float32Array | number[],
  rowCount: number,
  featureCount: number,
  labels: string[],
  letterbox: Letterbox,
  confidenceThreshold: number,
): Detection[] {
  const detections: Detection[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    const offset = row * featureCount;
    const prediction = bestPrediction(values, offset, featureCount, labels.length);

    if (prediction.classId < 0 || prediction.score < confidenceThreshold) {
      continue;
    }

    const centerX = values[offset];
    const centerY = values[offset + 1];
    const width = values[offset + 2];
    const height = values[offset + 3];

    const x = (centerX - width / 2 - letterbox.padX) / letterbox.scale;
    const y = (centerY - height / 2 - letterbox.padY) / letterbox.scale;
    const boxWidth = width / letterbox.scale;
    const boxHeight = height / letterbox.scale;

    detections.push({
      classId: prediction.classId,
      label: labels[prediction.classId] ?? `Class ${prediction.classId}`,
      score: prediction.score,
      box: {
        x: clamp(x, 0, letterbox.sourceWidth),
        y: clamp(y, 0, letterbox.sourceHeight),
        width: clamp(boxWidth, 0, letterbox.sourceWidth),
        height: clamp(boxHeight, 0, letterbox.sourceHeight),
      },
    });
  }

  return limitCandidates(detections);
}

function columnMajorOutputToDetections(
  values: Float32Array | number[],
  featureCount: number,
  rowCount: number,
  labels: string[],
  letterbox: Letterbox,
  confidenceThreshold: number,
): Detection[] {
  const detections: Detection[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    const prediction = bestColumnPrediction(values, row, rowCount, featureCount, labels.length);

    if (prediction.classId < 0 || prediction.score < confidenceThreshold) {
      continue;
    }

    const centerX = values[row];
    const centerY = values[rowCount + row];
    const width = values[rowCount * 2 + row];
    const height = values[rowCount * 3 + row];
    const x = (centerX - width / 2 - letterbox.padX) / letterbox.scale;
    const y = (centerY - height / 2 - letterbox.padY) / letterbox.scale;
    const boxWidth = width / letterbox.scale;
    const boxHeight = height / letterbox.scale;

    detections.push({
      classId: prediction.classId,
      label: labels[prediction.classId] ?? `Class ${prediction.classId}`,
      score: prediction.score,
      box: {
        x: clamp(x, 0, letterbox.sourceWidth),
        y: clamp(y, 0, letterbox.sourceHeight),
        width: clamp(boxWidth, 0, letterbox.sourceWidth),
        height: clamp(boxHeight, 0, letterbox.sourceHeight),
      },
    });
  }

  return limitCandidates(detections);
}

function bestPrediction(
  values: Float32Array | number[],
  offset: number,
  featureCount: number,
  labelCount: number,
): { classId: number; score: number } {
  if (labelCount > 0) {
    const hasObjectness = featureCount >= labelCount + 5;
    const objectness = hasObjectness ? values[offset + 4] : 1;
    const classOffset = offset + (hasObjectness ? 5 : 4);
    const best = bestClass(values, classOffset, labelCount);

    return {
      classId: best.classId,
      score: objectness * best.score,
    };
  }

  const withoutObjectness = bestClass(values, offset + 4, featureCount - 4);
  const withObjectness = bestClass(values, offset + 5, featureCount - 5);
  const withObjectnessScore = values[offset + 4] * withObjectness.score;

  if (withObjectness.classId >= 0 && withObjectnessScore > withoutObjectness.score) {
    return {
      classId: withObjectness.classId,
      score: withObjectnessScore,
    };
  }

  return withoutObjectness;
}

function bestColumnPrediction(
  values: Float32Array | number[],
  row: number,
  rowCount: number,
  featureCount: number,
  labelCount: number,
): { classId: number; score: number } {
  if (labelCount > 0) {
    const hasObjectness = featureCount >= labelCount + 5;
    const objectness = hasObjectness ? values[rowCount * 4 + row] : 1;
    const classStart = hasObjectness ? 5 : 4;
    const best = bestColumnClass(values, row, rowCount, classStart, labelCount);

    return {
      classId: best.classId,
      score: objectness * best.score,
    };
  }

  const withoutObjectness = bestColumnClass(values, row, rowCount, 4, featureCount - 4);
  const withObjectness = bestColumnClass(values, row, rowCount, 5, featureCount - 5);
  const withObjectnessScore = values[rowCount * 4 + row] * withObjectness.score;

  if (withObjectness.classId >= 0 && withObjectnessScore > withoutObjectness.score) {
    return {
      classId: withObjectness.classId,
      score: withObjectnessScore,
    };
  }

  return withoutObjectness;
}

function nonMaxSuppression(detections: Detection[], iouThreshold: number): Detection[] {
  const sorted = [...detections].sort((a, b) => b.score - a.score);
  const selected: Detection[] = [];

  while (sorted.length > 0) {
    const current = sorted.shift()!;
    selected.push(current);

    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      if (current.classId === sorted[i].classId && iou(current.box, sorted[i].box) > iouThreshold) {
        sorted.splice(i, 1);
      }
    }
  }

  return selected;
}

function iou(left: Detection["box"], right: Detection["box"]): number {
  const x1 = Math.max(left.x, right.x);
  const y1 = Math.max(left.y, right.y);
  const x2 = Math.min(left.x + left.width, right.x + right.width);
  const y2 = Math.min(left.y + left.height, right.y + right.height);
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = left.width * left.height + right.width * right.height - intersection;

  return union <= 0 ? 0 : intersection / union;
}

function bestClass(values: Float32Array | number[], offset: number, count: number): { classId: number; score: number } {
  let classId = -1;
  let score = 0;

  for (let index = 0; index < count; index += 1) {
    const candidate = values[offset + index];
    if (candidate > score) {
      classId = index;
      score = candidate;
    }
  }

  return { classId, score };
}

function bestColumnClass(
  values: Float32Array | number[],
  row: number,
  rowCount: number,
  featureStart: number,
  count: number,
): { classId: number; score: number } {
  let classId = -1;
  let score = 0;

  for (let index = 0; index < count; index += 1) {
    const candidate = values[rowCount * (featureStart + index) + row];
    if (candidate > score) {
      classId = index;
      score = candidate;
    }
  }

  return { classId, score };
}

function limitCandidates(detections: Detection[]): Detection[] {
  if (detections.length <= MAX_NMS_CANDIDATES) {
    return detections;
  }

  return detections.sort((a, b) => b.score - a.score).slice(0, MAX_NMS_CANDIDATES);
}

function getPreprocessCanvas(width: number, height: number): PreprocessCanvas {
  if (!preprocessCanvas) {
    preprocessCanvas =
      typeof document === "undefined" ? new OffscreenCanvas(width, height) : document.createElement("canvas");
    preprocessCtx = preprocessCanvas.getContext("2d", { willReadFrequently: true });
  }

  if (preprocessCanvas.width !== width || preprocessCanvas.height !== height) {
    preprocessCanvas.width = width;
    preprocessCanvas.height = height;
  }

  return preprocessCanvas;
}

function getPreprocessData(width: number, height: number): Float32Array {
  const size = 3 * width * height;

  if (!preprocessData || preprocessData.length !== size) {
    preprocessData = new Float32Array(size);
  }

  return preprocessData;
}

function getSourceSize(source: CanvasImageSource): { width: number; height: number } {
  if (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement) {
    return {
      width: source.videoWidth,
      height: source.videoHeight,
    };
  }

  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth,
      height: source.naturalHeight,
    };
  }

  if (
    (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) ||
    (typeof OffscreenCanvas !== "undefined" && source instanceof OffscreenCanvas)
  ) {
    return {
      width: source.width,
      height: source.height,
    };
  }

  if (source instanceof ImageBitmap) {
    return {
      width: source.width,
      height: source.height,
    };
  }

  return {
    width: 0,
    height: 0,
  };
}

function numberDimension(value: string | number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function classColor(classId: number): string {
  const colors = ["#46f0a4", "#ffd166", "#ff6b6b", "#78a7ff", "#c084fc", "#2dd4bf", "#fb923c"];
  return colors[classId % colors.length];
}
