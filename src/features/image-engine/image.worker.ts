/// <reference lib="webworker" />
import { renderImageToBlob } from './engine';
import type { ImageSettings } from './math';

type WorkerRequest = { bitmap: ImageBitmap; tool: string; settings: ImageSettings };
const workerScope = self as unknown as DedicatedWorkerGlobalScope;

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { bitmap, tool, settings } = event.data;
  try {
    const blob = await renderImageToBlob(bitmap, tool, settings, (width, height) => new OffscreenCanvas(width, height));
    workerScope.postMessage({ blob });
  } catch (error) {
    workerScope.postMessage({ error: error instanceof Error ? error.message : 'Image processing failed.' });
  } finally {
    bitmap.close();
  }
};

export {};
