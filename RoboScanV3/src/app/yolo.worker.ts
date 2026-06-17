import { createYoloSession, detectYolo, Detection, ModelInfo } from "./lib/yolo";
import type * as ort from "onnxruntime-web";

type WorkerModel = {
  session: ort.InferenceSession;
  info: ModelInfo;
};

type WorkerRequest =
  | {
      type: "load-model";
      modelFile: File;
    }
  | {
      type: "detect";
      requestId: number;
      frameUrl: string;
      confidenceThreshold: number;
      iouThreshold: number;
    };

type WorkerResponse =
  | {
      type: "model-ready";
      modelInfo: ModelInfo;
    }
  | {
      type: "detections";
      requestId: number;
      detections: Detection[];
    }
  | {
      type: "error";
      message: string;
    };

let model: WorkerModel | null = null;
const ROAD_DAMAGE_LABELS = ["pothole", "crack"];

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  try {
    if (message.type === "load-model") {
      const loaded = await createYoloSession(message.modelFile);
      model = {
        session: loaded.session,
        info: loaded.modelInfo,
      };
      postWorkerMessage({
        type: "model-ready",
        modelInfo: loaded.modelInfo,
      });
      return;
    }

    if (!model) {
      throw new Error("Load a model before detection.");
    }

    const bitmap = await frameUrlToBitmap(message.frameUrl);
    try {
      const detections = await detectYolo({
        session: model.session,
        modelInfo: model.info,
        source: bitmap,
        labels: ROAD_DAMAGE_LABELS,
        confidenceThreshold: message.confidenceThreshold,
        iouThreshold: message.iouThreshold,
      });

      postWorkerMessage({
        type: "detections",
        requestId: message.requestId,
        detections,
      });
    } finally {
      bitmap.close();
    }
  } catch (error) {
    postWorkerMessage({
      type: "error",
      message: error instanceof Error ? error.message : "An unexpected worker error occurred.",
    });
  }
};

async function frameUrlToBitmap(frameUrl: string): Promise<ImageBitmap> {
  const response = await fetch(frameUrl);
  const blob = await response.blob();

  return createImageBitmap(blob);
}

function postWorkerMessage(message: WorkerResponse): void {
  self.postMessage(message);
}
