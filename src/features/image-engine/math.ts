export type ImageSettings = Record<string, string | number | boolean>;

export const MAX_DIMENSION = 12_000;
export const MAX_PIXELS = 16_000_000;
export const MAX_FILE_BYTES = 40 * 1024 * 1024;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getOutputDimensions(width: number, height: number, tool: string, settings: ImageSettings): { width: number; height: number } {
  let outputWidth = width;
  let outputHeight = height;
  if (tool === 'resize') {
    outputWidth = Math.round(Number(settings.width) || width);
    outputHeight = settings.keepAspect ? Math.round(outputWidth * (height / width)) : Math.round(Number(settings.height) || height);
  }
  if (tool === 'upscale') {
    const scale = clamp(Number(settings.scale) || 2, 1, 4);
    outputWidth = Math.round(width * scale);
    outputHeight = Math.round(height * scale);
  }
  if (tool === 'crop') {
    const x = clamp(Number(settings.cropX) || 0, 0, 99) / 100;
    const y = clamp(Number(settings.cropY) || 0, 0, 99) / 100;
    outputWidth = Math.round(width * Math.min(clamp(Number(settings.cropWidth) || 80, 1, 100) / 100, 1 - x));
    outputHeight = Math.round(height * Math.min(clamp(Number(settings.cropHeight) || 80, 1, 100) / 100, 1 - y));
  }
  if (tool === 'rotate' && [90, 270].includes(Number(settings.angle))) [outputWidth, outputHeight] = [height, width];
  return { width: clamp(outputWidth, 1, MAX_DIMENSION), height: clamp(outputHeight, 1, MAX_DIMENSION) };
}

export function getOutputMime(settings: ImageSettings, sourceType: string): string {
  const requested = String(settings.format || sourceType || 'image/webp');
  return ['image/webp', 'image/jpeg', 'image/png'].includes(requested) ? requested : 'image/webp';
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function safeFileStem(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'image';
}
