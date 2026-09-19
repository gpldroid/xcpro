// XConvert Pro — dynamic tool controls
import { state } from './state.js';
import { renderCanvas } from './canvas.js';
function renderToolControls() {
            const container = document.getElementById('activeToolControls');
            let html = '';

            switch (state.activeTool) {
                case 'compress':
                    html = `
                        <div class="space-y-6">
                            <div>
                                <label class="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">Compression Presets</label>
                                <div class="grid grid-cols-3 gap-2">
                                    <button onclick="setCompressPreset(0.4)" class="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-ilove-brandBlue ${state.compress.quality === 0.4 ? 'bg-ilove-brandBlue text-white border-ilove-brandBlue' : 'text-slate-700 dark:text-slate-200'}">Extreme</button>
                                    <button onclick="setCompressPreset(0.7)" class="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-ilove-brandBlue ${state.compress.quality === 0.7 ? 'bg-ilove-brandBlue text-white border-ilove-brandBlue' : 'text-slate-700 dark:text-slate-200'}">Recommended</button>
                                    <button onclick="setCompressPreset(0.9)" class="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-ilove-brandBlue ${state.compress.quality === 0.9 ? 'bg-ilove-brandBlue text-white border-ilove-brandBlue' : 'text-slate-700 dark:text-slate-200'}">Low</button>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    <span>Quality Level</span>
                                    <span class="text-ilove-brandBlue">${Math.round(state.compress.quality * 100)}%</span>
                                </div>
                                <input type="range" min="0.1" max="1" step="0.05" value="${state.compress.quality}" oninput="state.compress.quality = parseFloat(this.value); renderCanvas(); renderToolControls();" class="w-full accent-ilove-brandBlue cursor-pointer">
                            </div>
                        </div>
                    `;
                    break;

                case 'resize':
                    html = `
                        <div class="space-y-5">
                            <div class="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl gap-1">
                                <button onclick="state.resize.mode = 'pixels'; renderToolControls(); renderCanvas();" class="flex-1 py-2 text-xs font-bold rounded-lg transition ${state.resize.mode === 'pixels' ? 'bg-white dark:bg-slate-800 shadow text-ilove-brandBlue' : 'text-slate-600 dark:text-slate-300'}">By Pixels</button>
                                <button onclick="state.resize.mode = 'percentage'; renderToolControls(); renderCanvas();" class="flex-1 py-2 text-xs font-bold rounded-lg transition ${state.resize.mode === 'percentage' ? 'bg-white dark:bg-slate-800 shadow text-ilove-brandBlue' : 'text-slate-600 dark:text-slate-300'}">By Percentage</button>
                            </div>

                            ${state.resize.mode === 'pixels' ? `
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Width (px)</label>
                                        <input type="number" value="${state.resize.width}" oninput="updateResizeDim('w', this.value)" class="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-ilove-brandBlue outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Height (px)</label>
                                        <input type="number" value="${state.resize.height}" oninput="updateResizeDim('h', this.value)" class="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-ilove-brandBlue outline-none">
                                    </div>
                                </div>
                            ` : `
                                <div>
                                    <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Percentage: <span class="text-ilove-brandBlue font-black">${state.resize.percentage}%</span></label>
                                    <div class="grid grid-cols-3 gap-2 mb-3">
                                        <button onclick="state.resize.percentage = 25; renderCanvas(); renderToolControls();" class="py-2 text-xs font-bold border rounded-xl dark:border-slate-700 hover:border-ilove-brandBlue">25%</button>
                                        <button onclick="state.resize.percentage = 50; renderCanvas(); renderToolControls();" class="py-2 text-xs font-bold border rounded-xl dark:border-slate-700 hover:border-ilove-brandBlue">50%</button>
                                        <button onclick="state.resize.percentage = 75; renderCanvas(); renderToolControls();" class="py-2 text-xs font-bold border rounded-xl dark:border-slate-700 hover:border-ilove-brandBlue">75%</button>
                                    </div>
                                    <input type="range" min="10" max="200" step="5" value="${state.resize.percentage}" oninput="state.resize.percentage = parseInt(this.value); renderCanvas(); renderToolControls();" class="w-full accent-ilove-brandBlue cursor-pointer">
                                </div>
                            `}
                        </div>
                    `;
                    break;

                case 'crop':
                    html = `
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Position X (%)</label>
                                <input type="range" min="0" max="80" value="${state.crop.x}" oninput="state.crop.x = parseInt(this.value); renderCanvas();" class="w-full accent-ilove-brandBlue">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Position Y (%)</label>
                                <input type="range" min="0" max="80" value="${state.crop.y}" oninput="state.crop.y = parseInt(this.value); renderCanvas();" class="w-full accent-ilove-brandBlue">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Crop Width (%)</label>
                                <input type="range" min="10" max="100" value="${state.crop.width}" oninput="state.crop.width = parseInt(this.value); renderCanvas();" class="w-full accent-ilove-brandBlue">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Crop Height (%)</label>
                                <input type="range" min="10" max="100" value="${state.crop.height}" oninput="state.crop.height = parseInt(this.value); renderCanvas();" class="w-full accent-ilove-brandBlue">
                            </div>
                        </div>
                    `;
                    break;

                case 'convert':
                    html = `
                        <div class="space-y-4">
                            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Target Format</label>
                            <div class="grid grid-cols-3 gap-2">
                                <button onclick="state.convert.format = 'jpeg'; renderToolControls(); renderCanvas();" class="py-3 font-bold border rounded-xl text-center dark:border-slate-600 ${state.convert.format === 'jpeg' ? 'border-ilove-brandBlue bg-sky-50 dark:bg-sky-950/50 text-ilove-brandBlue' : 'border-slate-200 text-slate-700 dark:text-slate-200'}">JPG</button>
                                <button onclick="state.convert.format = 'png'; renderToolControls(); renderCanvas();" class="py-3 font-bold border rounded-xl text-center dark:border-slate-600 ${state.convert.format === 'png' ? 'border-ilove-brandBlue bg-sky-50 dark:bg-sky-950/50 text-ilove-brandBlue' : 'border-slate-200 text-slate-700 dark:text-slate-200'}">PNG</button>
                                <button onclick="state.convert.format = 'webp'; renderToolControls(); renderCanvas();" class="py-3 font-bold border rounded-xl text-center dark:border-slate-600 ${state.convert.format === 'webp' ? 'border-ilove-brandBlue bg-sky-50 dark:bg-sky-950/50 text-ilove-brandBlue' : 'border-slate-200 text-slate-700 dark:text-slate-200'}">WEBP</button>
                            </div>
                        </div>
                    `;
                    break;

                case 'editor':
                    html = `
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Brightness: ${state.editor.brightness}%</label>
                                <input type="range" min="0" max="200" value="${state.editor.brightness}" oninput="state.editor.brightness = this.value; renderCanvas(); renderToolControls();" class="w-full accent-ilove-brandBlue">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Contrast: ${state.editor.contrast}%</label>
                                <input type="range" min="0" max="200" value="${state.editor.contrast}" oninput="state.editor.contrast = this.value; renderCanvas(); renderToolControls();" class="w-full accent-ilove-brandBlue">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Saturation: ${state.editor.saturation}%</label>
                                <input type="range" min="0" max="200" value="${state.editor.saturation}" oninput="state.editor.saturation = this.value; renderCanvas(); renderToolControls();" class="w-full accent-ilove-brandBlue">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Blur: ${state.editor.blur}px</label>
                                <input type="range" min="0" max="20" value="${state.editor.blur}" oninput="state.editor.blur = this.value; renderCanvas(); renderToolControls();" class="w-full accent-ilove-brandBlue">
                            </div>
                        </div>
                    `;
                    break;

                case 'removebg':
                    html = `
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Color Sensitivity: ${state.removebg.tolerance}</label>
                                <input type="range" min="5" max="80" value="${state.removebg.tolerance}" oninput="state.removebg.tolerance = parseInt(this.value); renderCanvas(); renderToolControls();" class="w-full accent-ilove-brandBlue">
                            </div>
                        </div>
                    `;
                    break;

                case 'upscale':
                    html = `
                        <div class="space-y-4">
                            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Resolution Scale Multiplier</label>
                            <div class="grid grid-cols-2 gap-3">
                                <button onclick="state.upscale.scale = 2; renderToolControls(); renderCanvas();" class="py-3 font-bold border rounded-xl text-center dark:border-slate-600 ${state.upscale.scale === 2 ? 'border-ilove-brandBlue bg-sky-50 dark:bg-sky-950/50 text-ilove-brandBlue' : 'border-slate-200 text-slate-700 dark:text-slate-200'}">2x Upscale</button>
                                <button onclick="state.upscale.scale = 4; renderToolControls(); renderCanvas();" class="py-3 font-bold border rounded-xl text-center dark:border-slate-600 ${state.upscale.scale === 4 ? 'border-ilove-brandBlue bg-sky-50 dark:bg-sky-950/50 text-ilove-brandBlue' : 'border-slate-200 text-slate-700 dark:text-slate-200'}">4x Upscale</button>
                            </div>
                        </div>
                    `;
                    break;

                case 'watermark':
                    html = `
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Watermark Text</label>
                                <input type="text" value="${state.watermark.text}" oninput="state.watermark.text = this.value; renderCanvas();" class="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-ilove-brandBlue outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Position</label>
                                <select onchange="state.watermark.position = this.value; renderCanvas();" class="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-2.5 text-sm outline-none">
                                    <option value="bottom-right" ${state.watermark.position==='bottom-right'?'selected':''}>Bottom Right</option>
                                    <option value="bottom-left" ${state.watermark.position==='bottom-left'?'selected':''}>Bottom Left</option>
                                    <option value="top-right" ${state.watermark.position==='top-right'?'selected':''}>Top Right</option>
                                    <option value="top-center" ${state.watermark.position==='top-center'?'selected':''}>Top Center</option>
                                    <option value="center" ${state.watermark.position==='center'?'selected':''}>Center</option>
                                </select>
                            </div>
                        </div>
                    `;
                    break;

                case 'meme':
                    html = `
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Top Text</label>
                                <input type="text" value="${state.meme.topText}" oninput="state.meme.topText = this.value; renderCanvas();" class="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-ilove-brandBlue outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Bottom Text</label>
                                <input type="text" value="${state.meme.bottomText}" oninput="state.meme.bottomText = this.value; renderCanvas();" class="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-ilove-brandBlue outline-none">
                            </div>
                        </div>
                    `;
                    break;

                case 'rotate':
                    html = `
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-3">
                                <button onclick="state.rotate.angle = (state.rotate.angle + 90) % 360; renderCanvas();" class="p-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-bold flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                                    <span class="ui-icon" aria-hidden="true">↻</span> Rotate 90°
                                </button>
                                <button onclick="state.rotate.angle = (state.rotate.angle - 90) % 360; renderCanvas();" class="p-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-bold flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                                    <span class="ui-icon" aria-hidden="true">↺</span> Rotate -90°
                                </button>
                            </div>
                        </div>
                    `;
                    break;
            }

            container.innerHTML = html;
        }

function setCompressPreset(val) {
            state.compress.quality = val;
            renderToolControls();
            renderCanvas();
        }

function updateResizeDim(type, val) {
            val = parseInt(val) || 1;
            if (type === 'w') {
                state.resize.width = val;
                if (state.resize.lockAspect && state.originalImage) {
                    const ratio = state.originalImage.height / state.originalImage.width;
                    state.resize.height = Math.round(val * ratio);
                }
            } else {
                state.resize.height = val;
                if (state.resize.lockAspect && state.originalImage) {
                    const ratio = state.originalImage.width / state.originalImage.height;
                    state.resize.width = Math.round(val * ratio);
                }
            }
            renderToolControls();
            renderCanvas();
        }

export { renderToolControls, setCompressPreset, updateResizeDim };
