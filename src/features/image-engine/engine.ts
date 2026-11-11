import { clamp, getOutputMime, MAX_DIMENSION, MAX_PIXELS, type ImageSettings } from './math';

export type CanvasFactory = (width: number, height: number) => HTMLCanvasElement | OffscreenCanvas;

function removeEdgeBackground(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number, tolerance: number) {
  const image = context.getImageData(0, 0, width, height);
  const pixels = image.data;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  const threshold = clamp(tolerance, 5, 120) * 2.2;
  const flood = (start: number) => {
    if (visited[start]) return;
    const offset = start * 4;
    const red = pixels[offset];
    const green = pixels[offset + 1];
    const blue = pixels[offset + 2];
    let read = 0;
    let write = 0;
    queue[write++] = start;
    visited[start] = 1;
    while (read < write) {
      const index = queue[read++];
      const pixel = index * 4;
      const dr = pixels[pixel] - red;
      const dg = pixels[pixel + 1] - green;
      const db = pixels[pixel + 2] - blue;
      if (Math.sqrt(dr * dr + dg * dg + db * db) > threshold) continue;
      pixels[pixel + 3] = 0;
      const x = index % width;
      const y = Math.floor(index / width);
      const neighbors = [x > 0 ? index - 1 : -1, x + 1 < width ? index + 1 : -1, y > 0 ? index - width : -1, y + 1 < height ? index + width : -1];
      for (const next of neighbors) {
        if (next < 0 || visited[next]) continue;
        const nextPixel = next * 4;
        const nr = pixels[nextPixel] - red;
        const ng = pixels[nextPixel + 1] - green;
        const nb = pixels[nextPixel + 2] - blue;
        if (Math.sqrt(nr * nr + ng * ng + nb * nb) <= threshold) {
          visited[next] = 1;
          queue[write++] = next;
        }
      }
    }
  };
  for (let x = 0; x < width; x += 1) {
    flood(x);
    if (height > 1) flood((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    flood(y * width);
    if (width > 1) flood(y * width + width - 1);
  }
  context.putImageData(image, 0, 0);
}

export async function renderImageToBlob(bitmap: ImageBitmap, tool: string, settings: ImageSettings, createCanvas: CanvasFactory): Promise<Blob> {
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  if (!sourceWidth || !sourceHeight || sourceWidth > MAX_DIMENSION || sourceHeight > MAX_DIMENSION || sourceWidth * sourceHeight > MAX_PIXELS) {
    throw new Error('The image dimensions exceed the safe browser processing limit.');
  }
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;
  if (tool === 'crop') {
    const x = clamp(Number(settings.cropX) || 0, 0, 99) / 100;
    const y = clamp(Number(settings.cropY) || 0, 0, 99) / 100;
    sw = Math.max(1, Math.round(sourceWidth * Math.min(clamp(Number(settings.cropWidth) || 80, 1, 100) / 100, 1 - x)));
    sh = Math.max(1, Math.round(sourceHeight * Math.min(clamp(Number(settings.cropHeight) || 80, 1, 100) / 100, 1 - y)));
    sx = Math.round(sourceWidth * x);
    sy = Math.round(sourceHeight * y);
  }
  let width = sw;
  let height = sh;
  if (tool === 'resize') {
    if (settings.mode === 'percentage') {
      const scale = clamp(Number(settings.percentage) || 80, 10, 200) / 100;
      width = Math.round(sw * scale);
      height = Math.round(sh * scale);
    } else {
      width = clamp(Math.round(Number(settings.width) || sw), 1, MAX_DIMENSION);
      height = settings.keepAspect ? Math.round(width * (sh / sw)) : clamp(Math.round(Number(settings.height) || sh), 1, MAX_DIMENSION);
    }
  } else if (tool === 'upscale') {
    const scale = clamp(Number(settings.scale) || 2, 1, 4);
    width = Math.round(sw * scale);
    height = Math.round(sh * scale);
  }
  const angle = tool === 'rotate' ? Number(settings.angle) || 0 : 0;
  const rotated = angle === 90 || angle === 270;
  const outputWidth = rotated ? height : width;
  const outputHeight = rotated ? width : height;
  if (outputWidth > MAX_DIMENSION || outputHeight > MAX_DIMENSION || outputWidth * outputHeight > MAX_PIXELS) {
    throw new Error('The requested output is too large for safe browser processing. Reduce the dimensions or scale factor.');
  }
  const canvas = createCanvas(outputWidth, outputHeight);
  const context = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) throw new Error('The browser could not create a 2D image-processing context.');
  context.clearRect(0, 0, outputWidth, outputHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.save();
  context.translate(outputWidth / 2, outputHeight / 2);
  context.rotate((angle * Math.PI) / 180);
  if (settings.flipH) context.scale(-1, 1);
  if (settings.flipV) context.scale(1, -1);
  if (tool === 'editor') context.filter = [
    `brightness(${clamp(Number(settings.brightness) || 100, 0, 200)}%)`,
    `contrast(${clamp(Number(settings.contrast) || 100, 0, 200)}%)`,
    `saturate(${clamp(Number(settings.saturation) || 100, 0, 200)}%)`,
    `blur(${clamp(Number(settings.blur) || 0, 0, 20)}px)`,
    `grayscale(${clamp(Number(settings.grayscale) || 0, 0, 100)}%)`,
    `sepia(${clamp(Number(settings.sepia) || 0, 0, 100)}%)`,
    `hue-rotate(${clamp(Number(settings.hue) || 0, 0, 360)}deg)`,
  ].join(' ');
  context.drawImage(bitmap, sx, sy, sw, sh, -width / 2, -height / 2, width, height);
  context.restore();
  if (tool === 'removebg') removeEdgeBackground(context, outputWidth, outputHeight, Number(settings.tolerance) || 42);
  if (tool === 'watermark') {
    const text = String(settings.watermarkText || 'XConvert Pro').slice(0, 120);
    const size = clamp(Number(settings.watermarkSize) || 36, 12, 120);
    const padding = Math.max(16, Math.round(outputWidth * 0.025));
    const position = String(settings.watermarkPosition || 'bottom-right');
    context.save();
    context.font = `700 ${size}px system-ui, sans-serif`;
    context.fillStyle = String(settings.watermarkColor || '#ffffff');
    context.strokeStyle = 'rgba(0,0,0,.65)';
    context.lineWidth = Math.max(2, size / 12);
    context.globalAlpha = clamp(Number(settings.watermarkOpacity) || 72, 10, 100) / 100;
    const textWidth = context.measureText(text).width;
    let x = padding;
    let y = outputHeight - padding;
    if (position === 'bottom-right' || position === 'top-right') x = outputWidth - textWidth - padding;
    if (position === 'top-right' || position === 'top-center') y = padding + size;
    if (position === 'top-center') x = (outputWidth - textWidth) / 2;
    if (position === 'center') { x = (outputWidth - textWidth) / 2; y = outputHeight / 2; }
    context.strokeText(text, x, y);
    context.fillText(text, x, y);
    context.restore();
  }
  if (tool === 'meme') {
    const size = clamp(Number(settings.memeSize) || 48, 18, 100);
    const top = String(settings.topText || '').slice(0, 100).toUpperCase();
    const bottom = String(settings.bottomText || '').slice(0, 100).toUpperCase();
    context.save();
    context.font = `900 ${size}px Impact, system-ui, sans-serif`;
    context.textAlign = 'center';
    context.lineJoin = 'round';
    context.lineWidth = Math.max(3, size / 9);
    context.strokeStyle = '#111111';
    context.fillStyle = String(settings.memeColor || '#ffffff');
    if (top) { context.textBaseline = 'top'; context.strokeText(top, outputWidth / 2, 18, outputWidth - 36); context.fillText(top, outputWidth / 2, 18, outputWidth - 36); }
    if (bottom) { context.textBaseline = 'bottom'; context.strokeText(bottom, outputWidth / 2, outputHeight - 18, outputWidth - 36); context.fillText(bottom, outputWidth / 2, outputHeight - 18, outputWidth - 36); }
    context.restore();
  }
  const mime = tool === 'removebg' ? 'image/png' : getOutputMime(settings, 'image/webp');
  if (mime === 'image/jpeg') {
    context.save();
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, outputWidth, outputHeight);
    context.restore();
  }
  const quality = clamp(Number(settings.quality) || 0.9, 0.1, 1);
  if ('convertToBlob' in canvas) return canvas.convertToBlob({ type: mime, quality });
  return new Promise((resolve, reject) => (canvas as HTMLCanvasElement).toBlob((blob) => blob ? resolve(blob) : reject(new Error('The browser could not encode this image.')), mime, quality));
}
