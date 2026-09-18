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
            const tol = Math.max(5, state.removebg.tolerance) * 2;
            const visited = new Uint8Array(cw * ch);
            const queue = [];

            const colorAt = (x, y) => {
                const i = (y * cw + x) * 4;
                return [data[i], data[i + 1], data[i + 2]];
            };

            const distance = (a, b) => Math.sqrt(
                Math.pow(a[0] - b[0], 2) +
                Math.pow(a[1] - b[1], 2) +
                Math.pow(a[2] - b[2], 2)
            );

            const addSeed = (x, y) => {
                const idx = y * cw + x;
                if (!visited[idx]) {
                    visited[idx] = 1;
                    queue.push([x, y, colorAt(x, y)]);
                }
            };

            for (let x = 0; x < cw; x++) {
                addSeed(x, 0);
                if (ch > 1) addSeed(x, ch - 1);
            }
            for (let y = 1; y < ch - 1; y++) {
                addSeed(0, y);
                if (cw > 1) addSeed(cw - 1, y);
            }

            let queueIndex = 0;
            while (queueIndex < queue.length) {
                const [x, y, seedColor] = queue[queueIndex++];
                const i = (y * cw + x) * 4;

                if (distance(colorAt(x, y), seedColor) <= tol) {
                    data[i + 3] = 0;
                    const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];

                    for (const [nx, ny] of neighbors) {
                        if (nx >= 0 && nx < cw && ny >= 0 && ny < ch) {
                            const ni = ny * cw + nx;
                            if (!visited[ni]) {
                                visited[ni] = 1;
                                queue.push([nx, ny, seedColor]);
                            }
                        }
                    }
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

function updateCropFromPointer(clientX, clientY) {
            if (state.activeTool !== 'crop' || !state.originalImage) return;
            const canvas = document.getElementById('mainCanvas');
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const px = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
            const py = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

            const c = state.crop;
            const maxX = Math.max(0, 100 - c.width);
            const maxY = Math.max(0, 100 - c.height);
            c.x = Math.round(Math.min(px, maxX));
            c.y = Math.round(Math.min(py, maxY));
            renderCanvas();
        }

function initCropInteraction() {
            const canvas = document.getElementById('mainCanvas');
            if (!canvas || canvas.dataset.cropInteraction === 'ready') return;
            canvas.dataset.cropInteraction = 'ready';

            let dragging = false;

            canvas.addEventListener('pointerdown', (event) => {
                if (state.activeTool !== 'crop' || !state.originalImage) return;
                dragging = true;
                canvas.setPointerCapture?.(event.pointerId);
                updateCropFromPointer(event.clientX - (state.crop.width / 200) * canvas.getBoundingClientRect().width,
                    event.clientY - (state.crop.height / 200) * canvas.getBoundingClientRect().height);
            });

            canvas.addEventListener('pointermove', (event) => {
                if (dragging) {
                    updateCropFromPointer(event.clientX - (state.crop.width / 200) * canvas.getBoundingClientRect().width,
                        event.clientY - (state.crop.height / 200) * canvas.getBoundingClientRect().height);
                }
            });

            canvas.addEventListener('pointerup', () => { dragging = false; });
            canvas.addEventListener('pointercancel', () => { dragging = false; });
        }

export { renderCanvas, processRemoveBg, drawCropOverlay, drawWatermarkOverlay, drawMemeOverlay , updateCropFromPointer, initCropInteraction };
