import { MAX_FILE_BYTES, MAX_PIXELS, MAX_DIMENSION, safeFileStem, getOutputDimensions, type ImageSettings } from './math';

export type ProcessResult = { blob: Blob; fileName: string; width: number; height: number; usedWorker: boolean };
const SUPPORTED_INPUT_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/bmp']);

export function validateImageFile(file: File): void {
  if (!SUPPORTED_INPUT_TYPES.has(file.type)) throw new Error('Choose a PNG, JPEG, WebP, AVIF, GIF, or BMP image.');
  if (file.size > MAX_FILE_BYTES) throw new Error('The file is larger than the 40 MB limit.');
}

function makeFileName(name: string, mime: string): string {
  const extension = mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp';
  return `${safeFileStem(name)}-xconvert.${extension}`;
}

function dimensions(width: number, height: number, tool: string, settings: ImageSettings) {
  return getOutputDimensions(width, height, tool, settings);
}

async function processOnMainThread(file: File, tool: string, settings: ImageSettings): Promise<{ blob: Blob; width: number; height: number }> {
  const { renderImageToBlob } = await import('./engine');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width > MAX_DIMENSION || bitmap.height > MAX_DIMENSION || bitmap.width * bitmap.height > MAX_PIXELS) {
      throw new Error('This image exceeds the safe browser processing dimensions.');
    }
    const blob = await renderImageToBlob(bitmap, tool, settings, (width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return canvas;
    });
    return { blob, ...dimensions(bitmap.width, bitmap.height, tool, settings) };
  } finally {
    bitmap.close();
  }
}

async function processInWorker(file: File, tool: string, settings: ImageSettings, signal?: AbortSignal): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION || width * height > MAX_PIXELS) {
    bitmap.close();
    throw new Error('This image exceeds the safe browser processing dimensions.');
  }
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' });
    } catch (error) {
      bitmap.close();
      reject(error);
      return;
    }
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', abort);
      worker.terminate();
      callback();
    };
    const abort = () => finish(() => reject(new DOMException('Image processing was cancelled.', 'AbortError')));
    signal?.addEventListener('abort', abort, { once: true });
    worker.onmessage = (event: MessageEvent<{ blob?: Blob; error?: string }>) => {
      if (event.data.error) return finish(() => reject(new Error(event.data.error)));
      if (!event.data.blob) return finish(() => reject(new Error('The image worker returned no output.')));
      finish(() => resolve({ blob: event.data.blob as Blob, ...dimensions(width, height, tool, settings) }));
    };
    worker.onerror = () => finish(() => reject(new Error('The image worker failed.')));
    try {
      worker.postMessage({ bitmap, tool, settings }, [bitmap]);
    } catch (error) {
      finish(() => reject(error instanceof Error ? error : new Error('Could not start image processing.')));
    }
  });
}

export async function processImageFile(file: File, tool: string, settings: ImageSettings, signal?: AbortSignal): Promise<ProcessResult> {
  validateImageFile(file);
  if (signal?.aborted) throw new DOMException('Image processing was cancelled.', 'AbortError');
  let result: { blob: Blob; width: number; height: number };
  let usedWorker = false;
  if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
    try {
      result = await processInWorker(file, tool, settings, signal);
      usedWorker = true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      result = await processOnMainThread(file, tool, settings);
    }
  } else {
    result = await processOnMainThread(file, tool, settings);
  }
  return { ...result, fileName: makeFileName(file.name, result.blob.type), usedWorker };
}
