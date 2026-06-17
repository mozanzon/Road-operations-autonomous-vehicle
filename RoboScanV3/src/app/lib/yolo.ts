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

export type DetectionStats = {
  outputShape: number[];
  confidenceThreshold: number;
  candidateCount: number;
  aboveThresholdCount: number;
  topScore: number;
  topClassId: number;
  topLabel: string;
  detectionCount: number;
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
  const result = await detectYoloDetailed({
    session,
    modelInfo,
    source,
    labels,
    confidenceThreshold,
    iouThreshold,
  });

  return result.detections;
}

export async function detectYoloDetailed({
  session,
  modelInfo,
  source,
  labels = [],
  confidenceThreshold,
  iouThreshold,
}: DetectOptions): Promise<{ detections: Detection[]; stats: DetectionStats }> {
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
  const stats = outputToStats(output, labels, confidenceThreshold);
  const detections = outputToDetections(output, labels, letterbox, confidenceThreshold);
  const selected = nonMaxSuppression(detections, iouThreshold);

  return {
    detections: selected,
    stats: {
      ...stats,
      detectionCount: selected.length,
    },
  };
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

  if (second >= 6 && first > second && looksLikeNmsOutput(values, first, second)) {
    return nmsRowMajorOutputToDetections(values, first, second, labels, letterbox, confidenceThreshold);
  }

  if (first >= 6 && second > first && looksLikeNmsOutput(values, second, first, true)) {
    return nmsColumnMajorOutputToDetections(values, first, second, labels, letterbox, confidenceThreshold);
  }

  if (second >= 5 && first > second) {
    return rowMajorOutputToDetections(values, first, second, labels, letterbox, confidenceThreshold);
  }

  if (first >= 5 && second > first) {
    return columnMajorOutputToDetections(values, first, second, labels, letterbox, confidenceThreshold);
  }

  const features = Math.max(5, labels.length + 5);
  return rowMajorOutputToDetections(values, Math.floor(values.length / features), features, labels, letterbox, confidenceThreshold);
}

function outputToStats(
  output: ort.Tensor,
  labels: string[],
  confidenceThreshold: number,
): DetectionStats {
  const dims = output.dims;
  const values = output.data as Float32Array | number[];
  const stats: DetectionStats = {
    outputShape: [...dims],
    confidenceThreshold,
    candidateCount: 0,
    aboveThresholdCount: 0,
    topScore: 0,
    topClassId: -1,
    topLabel: "No candidate",
    detectionCount: 0,
  };

  if (dims.length !== 3) {
    return stats;
  }

  const first = dims[1];
  const second = dims[2];
  const record = (prediction: { classId: number; score: number }) => {
    if (prediction.classId < 0) {
      return;
    }

    stats.candidateCount += 1;
    if (prediction.score >= confidenceThreshold) {
      stats.aboveThresholdCount += 1;
    }
    if (prediction.score > stats.topScore) {
      stats.topScore = prediction.score;
      stats.topClassId = prediction.classId;
      stats.topLabel = labels[prediction.classId] ?? `Class ${prediction.classId}`;
    }
  };

  if (second >= 6 && first > second && looksLikeNmsOutput(values, first, second)) {
    for (let row = 0; row < first; row += 1) {
      const offset = row * second;
      record({
        classId: Math.max(0, Math.round(values[offset + 5] ?? 0)),
        score: normalizeScore(values[offset + 4]),
      });
    }
    return stats;
  }

  if (first >= 6 && second > first && looksLikeNmsOutput(values, second, first, true)) {
    for (let row = 0; row < second; row += 1) {
      record({
        classId: Math.max(0, Math.round(values[second * 5 + row] ?? 0)),
        score: normalizeScore(values[second * 4 + row]),
      });
    }
    return stats;
  }

  if (second >= 5 && first > second) {
    for (let row = 0; row < first; row += 1) {
      record(bestPrediction(values, row * second, second, labels.length));
    }
    return stats;
  }

  if (first >= 5 && second > first) {
    for (let row = 0; row < second; row += 1) {
      record(bestColumnPrediction(values, row, second, first, labels.length));
    }
    return stats;
  }

  const features = Math.max(5, labels.length + 5);
  const rowCount = Math.floor(values.length / features);
  for (let row = 0; row < rowCount; row += 1) {
    record(bestPrediction(values, row * features, features, labels.length));
  }

  return stats;
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

function nmsRowMajorOutputToDetections(
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
    const score = normalizeScore(values[offset + 4]);
    const classId = Math.max(0, Math.round(values[offset + 5] ?? 0));

    if (score < confidenceThreshold) {
      continue;
    }

    const x1 = (values[offset] - letterbox.padX) / letterbox.scale;
    const y1 = (values[offset + 1] - letterbox.padY) / letterbox.scale;
    const x2 = (values[offset + 2] - letterbox.padX) / letterbox.scale;
    const y2 = (values[offset + 3] - letterbox.padY) / letterbox.scale;

    detections.push({
      classId,
      label: labels[classId] ?? `Class ${classId}`,
      score,
      box: {
        x: clamp(Math.min(x1, x2), 0, letterbox.sourceWidth),
        y: clamp(Math.min(y1, y2), 0, letterbox.sourceHeight),
        width: clamp(Math.abs(x2 - x1), 0, letterbox.sourceWidth),
        height: clamp(Math.abs(y2 - y1), 0, letterbox.sourceHeight),
      },
    });
  }

  return limitCandidates(detections);
}

function nmsColumnMajorOutputToDetections(
  values: Float32Array | number[],
  featureCount: number,
  rowCount: number,
  labels: string[],
  letterbox: Letterbox,
  confidenceThreshold: number,
): Detection[] {
  const detections: Detection[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    const score = normalizeScore(values[rowCount * 4 + row]);
    const classId = Math.max(0, Math.round(values[rowCount * 5 + row] ?? 0));

    if (score < confidenceThreshold) {
      continue;
    }

    const x1 = (values[row] - letterbox.padX) / letterbox.scale;
    const y1 = (values[rowCount + row] - letterbox.padY) / letterbox.scale;
    const x2 = (values[rowCount * 2 + row] - letterbox.padX) / letterbox.scale;
    const y2 = (values[rowCount * 3 + row] - letterbox.padY) / letterbox.scale;

    detections.push({
      classId,
      label: labels[classId] ?? `Class ${classId}`,
      score,
      box: {
        x: clamp(Math.min(x1, x2), 0, letterbox.sourceWidth),
        y: clamp(Math.min(y1, y2), 0, letterbox.sourceHeight),
        width: clamp(Math.abs(x2 - x1), 0, letterbox.sourceWidth),
        height: clamp(Math.abs(y2 - y1), 0, letterbox.sourceHeight),
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
    const objectness = hasObjectness ? normalizeScore(values[offset + 4]) : 1;
    const classOffset = offset + (hasObjectness ? 5 : 4);
    const best = bestClass(values, classOffset, labelCount);

    return {
      classId: best.classId,
      score: objectness * best.score,
    };
  }

  const withoutObjectness = bestClass(values, offset + 4, featureCount - 4);
  const withObjectness = bestClass(values, offset + 5, featureCount - 5);
  const withObjectnessScore = normalizeScore(values[offset + 4]) * withObjectness.score;

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
    const objectness = hasObjectness ? normalizeScore(values[rowCount * 4 + row]) : 1;
    const classStart = hasObjectness ? 5 : 4;
    const best = bestColumnClass(values, row, rowCount, classStart, labelCount);

    return {
      classId: best.classId,
      score: objectness * best.score,
    };
  }

  const withoutObjectness = bestColumnClass(values, row, rowCount, 4, featureCount - 4);
  const withObjectness = bestColumnClass(values, row, rowCount, 5, featureCount - 5);
  const withObjectnessScore = normalizeScore(values[rowCount * 4 + row]) * withObjectness.score;

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
    const candidate = normalizeScore(values[offset + index]);
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
    const candidate = normalizeScore(values[rowCount * (featureStart + index) + row]);
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

function looksLikeNmsOutput(
  values: Float32Array | number[],
  rowCount: number,
  featureCount: number,
  columnMajor = false,
): boolean {
  if (featureCount < 6 || featureCount > 7) {
    return false;
  }

  const sampleCount = Math.min(rowCount, 24);
  let integerLikeClasses = 0;
  let cornerLikeBoxes = 0;

  for (let row = 0; row < sampleCount; row += 1) {
    const x1 = columnMajor ? values[row] : values[row * featureCount];
    const y1 = columnMajor ? values[rowCount + row] : values[row * featureCount + 1];
    const x2 = columnMajor ? values[rowCount * 2 + row] : values[row * featureCount + 2];
    const y2 = columnMajor ? values[rowCount * 3 + row] : values[row * featureCount + 3];
    const classValue = columnMajor ? values[rowCount * 5 + row] : values[row * featureCount + 5];

    if (Number.isFinite(classValue) && Math.abs(classValue - Math.round(classValue)) < 0.001 && classValue >= 0) {
      integerLikeClasses += 1;
    }

    if (Number.isFinite(x1) && Number.isFinite(y1) && Number.isFinite(x2) && Number.isFinite(y2) && x2 > x1 && y2 > y1) {
      cornerLikeBoxes += 1;
    }
  }

  return integerLikeClasses >= Math.ceil(sampleCount * 0.75) && cornerLikeBoxes >= Math.ceil(sampleCount * 0.6);
}

function normalizeScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value >= 0 && value <= 1) {
    return value;
  }

  if (value <= -20) {
    return 0;
  }

  if (value >= 20) {
    return 1;
  }

  return 1 / (1 + Math.exp(-value));
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
      width: source.naturalWidth || source.clientWidth || source.width,
      height: source.naturalHeight || source.clientHeight || source.height,
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
