// XConvert Pro — export and download
import { state } from './state.js';
import { showToast } from './workspace.js';
function processAndDownload() {
            if (!state.originalImage) {
                showToast('Choose an image before exporting.');
                return;
            }

            try {
            const mainCanvas = document.getElementById('mainCanvas');
            let exportCanvas = mainCanvas;

            if (state.activeTool === 'crop') {
                const cropCanvas = document.createElement('canvas');
                const ctx = cropCanvas.getContext('2d');
                const cw = mainCanvas.width;
                const ch = mainCanvas.height;
                const c = state.crop;

                const cropX = (c.x / 100) * cw;
                const cropY = (c.y / 100) * ch;
                const cropW = (c.width / 100) * cw;
                const cropH = (c.height / 100) * ch;

                cropCanvas.width = cropW;
                cropCanvas.height = cropH;

                ctx.drawImage(mainCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                exportCanvas = cropCanvas;
            }

            let mimeType = 'image/jpeg';
            let extension = 'jpg';

            if (state.activeTool === 'convert') {
                mimeType = `image/${state.convert.format}`;
                extension = state.convert.format;
            } else if (state.activeTool === 'removebg') {
                mimeType = 'image/png';
                extension = 'png';
            }

            const quality = state.activeTool === 'compress' ? state.compress.quality : 0.92;
            const dataUrl = exportCanvas.toDataURL(mimeType, quality);
            if (!dataUrl || dataUrl === 'data:,') throw new Error('The browser could not create an image export.');
            const actualMime = dataUrl.match(/^data:([^;,]+)/)?.[1];
            if (actualMime) extension = actualMime.split('/')[1].replace('jpeg', 'jpg');

            const nameParts = state.loadedImageName.split('.');
            const baseName = nameParts.slice(0, -1).join('.') || 'image';
            const fileName = `${baseName}_xconvert.${extension}`;

            const downloadLink = document.getElementById('downloadLink');
            if (!downloadLink) throw new Error('The download control is unavailable.');
            downloadLink.href = dataUrl;
            downloadLink.download = fileName;

            const outputBytes = Math.round(dataUrl.length * 3 / 4);
            if (state.originalFileSize > 0 && outputBytes < state.originalFileSize) {
                const percent = Math.round((1 - outputBytes / state.originalFileSize) * 100);
                document.getElementById('savingsNotice').innerText = `Your image is ${percent}% smaller! (${Math.round(state.originalFileSize / 1024)}KB → ${Math.round(outputBytes / 1024)}KB)`;
            } else {
                document.getElementById('savingsNotice').innerText = 'Your modified image is ready to download.';
            }

            const modal = document.getElementById('downloadModal');
            if (modal) modal.classList.remove('hidden');
            } catch (error) {
                console.error('XConvert Pro export failed:', error);
                showToast('Export failed. Try a smaller image or another output format.');
            }
        }

function closeDownloadModal() {
            document.getElementById('downloadModal')?.classList.add('hidden');
        }

export { processAndDownload, closeDownloadModal };
