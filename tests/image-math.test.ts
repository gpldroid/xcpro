import { describe, expect, it } from 'vitest';
import { clamp, formatBytes, getOutputDimensions, getOutputMime, safeFileStem } from '../src/features/image-engine/math';

describe('image engine helpers', () => {
  it('clamps invalid or out-of-range dimensions', () => {
    expect(clamp(150, 1, 100)).toBe(100);
    expect(clamp(-5, 1, 100)).toBe(1);
  });

  it('preserves aspect ratio when resizing', () => {
    expect(getOutputDimensions(1600, 900, 'resize', { width: 800, keepAspect: true })).toEqual({ width: 800, height: 450 });
  });

  it('swaps dimensions for quarter-turn rotations', () => {
    expect(getOutputDimensions(1200, 800, 'rotate', { angle: 90 })).toEqual({ width: 800, height: 1200 });
  });

  it('calculates crop dimensions within the source bounds', () => {
    expect(getOutputDimensions(1000, 500, 'crop', { cropWidth: 50, cropHeight: 40 })).toEqual({ width: 500, height: 200 });
  });

  it('uses only supported output MIME types', () => {
    expect(getOutputMime({ format: 'image/png' }, 'image/jpeg')).toBe('image/png');
    expect(getOutputMime({ format: 'image/svg+xml' }, 'image/jpeg')).toBe('image/webp');
  });

  it('formats byte sizes and sanitizes file names', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(safeFileStem('my holiday photo!.jpg')).toBe('my-holiday-photo');
  });
});
