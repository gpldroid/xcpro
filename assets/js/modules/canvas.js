// XConvert Pro — canvas rendering and image effects
import { state } from './state.js';
function renderCanvas() {
            if (!state.originalImage) return;
            
            const canvas = document.getElementById('mainCanvas');
            const ctx = canvas.getContext('2d');
            const img = state.originalImage;

            let targetWidth = img.width;
            let targetHeight = img.height;

            if (state.activeTool === 'resize') {
                if (state.resize.mode === 'percentage') {
                    targetWidth = Math.round(img.width * (state.resize.percentage / 100));
                    targetHeight = Math.round(img.height * (state.resize.percentage / 100));
                } else {
                    targetWidth = parseInt(state.resize.width) || img.width;
                    targetHeight = parseInt(state.resize.height) || img.height;
                }
            } else if (state.activeTool === 'upscale') {
                targetWidth = img.width * state.upscale.scale;
                targetHeight = img.height * state.upscale.scale;
            }

            const isRotated90 = (state.rotate.angle % 180 !== 0);
            canvas.width = isRotated90 ? targetHeight : targetWidth;
            canvas.height = isRotated90 ? targetWidth : targetHeight;

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((state.rotate.angle * Math.PI) / 180);
            ctx.scale(state.rotate.flipH ? -1 : 1, state.rotate.flipV ? -1 : 1);

            const ed = state.editor;
            ctx.filter = `brightness(${ed.brightness}%) contrast(${ed.contrast}%) saturate(${ed.saturation}%) blur(${ed.blur}px) grayscale(${ed.grayscale}%) sepia(${ed.sepia}%) hue-rotate(${ed.hue}deg)`;

            ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
            ctx.restore();

            if (state.activeTool === 'removebg') {
                processRemoveBg(ctx, canvas.width, canvas.height);
            }

            if (state.activeTool === 'crop') {
                drawCropOverlay(ctx, canvas.width, canvas.height);
            }

            if (state.activeTool === 'watermark' && state.watermark.text) {
                drawWatermarkOverlay(ctx, canvas.width, canvas.height);
            }

            if (state.activeTool === 'meme') {
                drawMemeOverlay(ctx, canvas.width, canvas.height);
            }

            document.getElementById('origDimensions').innerText = `${canvas.width} x ${canvas.height} px`;
            
            const qual = state.activeTool === 'compress' ? state.compress.quality : 0.85;
            const dataUrl = canvas.toDataURL('image/jpeg', qual);
            const estKb = Math.round((dataUrl.length * 3 / 4) / 1024);
            document.getElementById('fileSizeEst').innerText = `~${estKb} KB`;
        }

function processRemoveBg(ctx, cw, ch) {
            const imgData = ctx.getImageData(0, 0, cw, ch);
            const data = imgData.data;
            const tol = state.removebg.tolerance;

            const bgR = data[0];
            const bgG = data[1];
            const bgB = data[2];

            for (let i = 0; i < data.length; i += 4) {
                const diff = Math.sqrt(
                    Math.pow(data[i] - bgR, 2) +
                    Math.pow(data[i + 1] - bgG, 2) +
                    Math.pow(data[i + 2] - bgB, 2)
                );

                if (diff < tol * 2) {
                    data[i + 3] = 0;
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }

function drawCropOverlay(ctx, cw, ch) {
            const c = state.crop;
            const x = (c.x / 100) * cw;
            const y = (c.y / 100) * ch;
            const w = (c.width / 100) * cw;
            const h = (c.height / 100) * ch;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(0, 0, cw, ch);

            ctx.clearRect(x, y, w, h);

            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.clip();
            ctx.drawImage(state.originalImage, 0, 0, cw, ch);
            ctx.restore();

            ctx.strokeStyle = '#00a8e8';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);
        }

function drawWatermarkOverlay(ctx, cw, ch) {
            const wm = state.watermark;
            ctx.save();
            ctx.font = `bold ${wm.fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
            ctx.fillStyle = wm.color;
            ctx.globalAlpha = parseFloat(wm.opacity);

            const metrics = ctx.measureText(wm.text);
            const textWidth = metrics.width;
            const padding = 30;

            let x = padding;
            let y = padding + wm.fontSize;

            if (wm.position === 'top-center') {
                x = (cw - textWidth) / 2;
            } else if (wm.position === 'top-right') {
                x = cw - textWidth - padding;
            } else if (wm.position === 'center') {
                x = (cw - textWidth) / 2;
                y = ch / 2;
            } else if (wm.position === 'bottom-left') {
                y = ch - padding;
            } else if (wm.position === 'bottom-right') {
                x = cw - textWidth - padding;
                y = ch - padding;
            }

            ctx.fillText(wm.text, x, y);
            ctx.restore();
        }

function drawMemeOverlay(ctx, cw, ch) {
            const m = state.meme;
            ctx.save();
            ctx.font = `900 ${m.fontSize}px Impact, sans-serif`;
            ctx.fillStyle = m.textColor;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = Math.max(3, m.fontSize / 8);
            ctx.textAlign = 'center';

            if (m.topText) {
                ctx.textBaseline = 'top';
                ctx.strokeText(m.topText, cw / 2, 20);
                ctx.fillText(m.topText, cw / 2, 20);
            }

            if (m.bottomText) {
                ctx.textBaseline = 'bottom';
                ctx.strokeText(m.bottomText, cw / 2, ch - 20);
                ctx.fillText(m.bottomText, cw / 2, ch - 20);
            }

            ctx.restore();
        }

export { renderCanvas, processRemoveBg, drawCropOverlay, drawWatermarkOverlay, drawMemeOverlay };
