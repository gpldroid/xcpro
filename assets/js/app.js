// Application Global State
        const state = {
            currentPage: 'home',
            activeTool: 'compress',
            originalImage: null,
            loadedImageName: 'image.jpg',
            originalFileSize: 0,
            
            compress: { quality: 0.70 },
            resize: { width: 1200, height: 800, lockAspect: true, percentage: 80, mode: 'pixels' },
            crop: { x: 10, y: 10, width: 80, height: 80 },
            convert: { format: 'jpeg', quality: 0.9 },
            editor: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
            removebg: { tolerance: 30 },
            upscale: { scale: 2 },
            watermark: { text: '© XConvert Pro', fontSize: 36, opacity: 0.7, color: '#ffffff', position: 'bottom-right' },
            meme: { topText: 'WHEN YOU USE', bottomText: 'XCONVERT PRO FOR YOUR PHOTOS', fontSize: 42, textColor: '#ffffff' },
            rotate: { angle: 0, flipH: false, flipV: false }
        };

        const toolsMeta = {
            compress: { title: 'Compress IMAGE', desc: 'Compress JPG, PNG, SVG or GIF with the best quality and compression.', icon: 'fa-file-arrow-down', actionText: 'Compress IMAGES' },
            resize: { title: 'Resize IMAGE', desc: 'Define your dimensions, by percent or pixel, and resize your images.', icon: 'fa-expand', actionText: 'Resize IMAGES' },
            crop: { title: 'Crop IMAGE', desc: 'Crop JPG, PNG or GIFs by defining an area in pixels.', icon: 'fa-crop-simple', actionText: 'Crop IMAGE' },
            convert: { title: 'Convert to JPG', desc: 'Turn PNG, GIF, WEBP or SVG images easily to JPG format.', icon: 'fa-right-left', actionText: 'Convert to JPG' },
            editor: { title: 'Photo Editor', desc: 'Adjust brightness, contrast, saturation, and apply filters.', icon: 'fa-sliders', actionText: 'Save edited IMAGE' },
            removebg: { title: 'Remove Background', desc: 'Automatically erase background colors with instant transparent output.', icon: 'fa-wand-magic-sparkles', actionText: 'Remove Background' },
            upscale: { title: 'Upscale IMAGE', desc: 'Enlarge image resolution with detail enhancement.', icon: 'fa-angles-up', actionText: 'Upscale IMAGES' },
            watermark: { title: 'Watermark IMAGE', desc: 'Stamp an image or text over your images in seconds.', icon: 'fa-stamp', actionText: 'Watermark IMAGES' },
            meme: { title: 'Meme Generator', desc: 'Caption memes or upload your own images to make custom memes.', icon: 'fa-face-laugh-squint', actionText: 'Generate Meme' },
            rotate: { title: 'Rotate IMAGE', desc: 'Rotate many images at once. Choose landscape or portrait.', icon: 'fa-rotate', actionText: 'Rotate IMAGES' }
        };

        function navigateTo(target) {
            state.currentPage = target;
            
            // Hide all page views
            document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (target === 'home') {
                document.getElementById('view-home').classList.remove('hidden');
            } else if (target === 'pricing') {
                document.getElementById('view-pricing').classList.remove('hidden');
                document.getElementById('nav-pricing')?.classList.add('active');
            } else if (target === 'api') {
                document.getElementById('view-api').classList.remove('hidden');
                document.getElementById('nav-api')?.classList.add('active');
            } else if (toolsMeta[target]) {
                // Dedicated Tool View Page
                state.activeTool = target;
                const meta = toolsMeta[target];
                document.getElementById('toolPageTitle').innerText = meta.title;
                document.getElementById('toolPageDesc').innerText = meta.desc;
                document.getElementById('toolPageIcon').className = `fa-solid ${meta.icon}`;
                
                document.getElementById('view-tool').classList.remove('hidden');
                document.getElementById(`nav-${target}`)?.classList.add('active');
            }
        }

        function toggleDarkMode() {
            const html = document.documentElement;
            const icon = document.getElementById('themeToggleIcon');
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                icon.className = 'fa-solid fa-moon text-base text-slate-700';
            } else {
                html.classList.add('dark');
                icon.className = 'fa-solid fa-sun text-base text-amber-400';
            }
        }

        function toggleMobileMenu() {
            document.getElementById('mobileMenu').classList.toggle('hidden');
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMsg').innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }

        function openToolWorkspace(toolKey) {
            state.activeTool = toolKey || state.activeTool;
            const meta = toolsMeta[state.activeTool] || toolsMeta.compress;
            
            document.getElementById('activeToolTitle').innerText = meta.title;
            document.getElementById('activeToolDesc').innerText = meta.desc;
            document.getElementById('activeToolIcon').className = `fa-solid ${meta.icon} text-ilove-brandBlue text-2xl`;
            document.getElementById('actionButtonText').innerText = meta.actionText;

            document.getElementById('sidebarToolTitle').innerText = meta.title + ' Options';
            document.getElementById('sidebarToolSubtitle').innerText = meta.desc;
            
            document.getElementById('toolWorkspace').classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            renderToolControls();
            
            if (state.originalImage) {
                showPreviewUI();
                renderCanvas();
            } else {
                showDropzoneUI();
            }
        }

        function closeTool() {
            document.getElementById('toolWorkspace').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        function triggerToolUpload() {
            document.getElementById('toolFileInput').click();
        }

        function handleToolPageUpload(e) {
            const file = e.target.files[0];
            if (file) {
                state.originalFileSize = file.size;
                loadImageFromFile(file, true);
            }
        }

        function showDropzoneUI() {
            document.getElementById('dropzone').classList.remove('hidden');
            document.getElementById('previewContainer').classList.add('hidden');
            document.getElementById('previewContainer').classList.remove('flex');
            document.getElementById('controlsSidebar').classList.add('hidden');
            document.getElementById('controlsSidebar').classList.remove('flex');
        }

        function showPreviewUI() {
            document.getElementById('dropzone').classList.add('hidden');
            document.getElementById('previewContainer').classList.remove('hidden');
            document.getElementById('previewContainer').classList.add('flex');
            document.getElementById('controlsSidebar').classList.remove('hidden');
            document.getElementById('controlsSidebar').classList.add('flex');
        }

        function handleFileSelect(e) {
            const file = e.target.files[0];
            if (file) {
                state.originalFileSize = file.size;
                loadImageFromFile(file, false);
            }
        }

        function loadImageFromFile(file, autoOpenWorkspace = false) {
            state.loadedImageName = file.name || 'image.jpg';
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    state.originalImage = img;
                    state.resize.width = img.width;
                    state.resize.height = img.height;
                    
                    if (autoOpenWorkspace) {
                        openToolWorkspace();
                    } else {
                        showPreviewUI();
                        renderToolControls();
                        renderCanvas();
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }

        function loadSampleImageAndLaunch() {
            loadSampleImage(true);
        }

        function loadSampleImage(autoOpen = false) {
            const canvas = document.createElement('canvas');
            canvas.width = 1600;
            canvas.height = 1000;
            const ctx = canvas.getContext('2d');
            
            const gradient = ctx.createLinearGradient(0, 0, 1600, 1000);
            gradient.addColorStop(0, '#18243b');
            gradient.addColorStop(0.5, '#00a8e8');
            gradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1600, 1000);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.beginPath();
            ctx.arc(400, 500, 350, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 72px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('XConvert Pro Sample Image', 800, 520);

            const img = new Image();
            img.onload = function() {
                state.originalImage = img;
                state.loadedImageName = 'sample-image.jpg';
                state.originalFileSize = 850000;
                state.resize.width = img.width;
                state.resize.height = img.height;
                
                if (autoOpen) {
                    openToolWorkspace();
                } else {
                    showPreviewUI();
                    renderToolControls();
                    renderCanvas();
                }
            };
            img.src = canvas.toDataURL('image/jpeg');
        }

        function resetWorkspaceImage() {
            if (!state.originalImage) return;
            state.editor = { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 };
            state.rotate = { angle: 0, flipH: false, flipV: false };
            state.resize.width = state.originalImage.width;
            state.resize.height = state.originalImage.height;
            state.resize.percentage = 80;
            state.crop = { x: 10, y: 10, width: 80, height: 80 };
            renderToolControls();
            renderCanvas();
        }

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
            ctx.font = `bold ${wm.fontSize}px Inter, sans-serif`;
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
                                    <i class="fa-solid fa-rotate-right"></i> Rotate 90°
                                </button>
                                <button onclick="state.rotate.angle = (state.rotate.angle - 90) % 360; renderCanvas();" class="p-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-bold flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                                    <i class="fa-solid fa-rotate-left"></i> Rotate -90°
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

        function processAndDownload() {
            if (!state.originalImage) return;

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

            const nameParts = state.loadedImageName.split('.');
            const baseName = nameParts.slice(0, -1).join('.') || 'image';
            const fileName = `${baseName}_xconvert.${extension}`;

            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = dataUrl;
            downloadLink.download = fileName;

            const outputBytes = Math.round(dataUrl.length * 3 / 4);
            if (state.originalFileSize > 0 && outputBytes < state.originalFileSize) {
                const percent = Math.round((1 - outputBytes / state.originalFileSize) * 100);
                document.getElementById('savingsNotice').innerText = `Your image is ${percent}% smaller! (${Math.round(state.originalFileSize / 1024)}KB → ${Math.round(outputBytes / 1024)}KB)`;
            } else {
                document.getElementById('savingsNotice').innerText = 'Your modified image is ready to download.';
            }

            document.getElementById('downloadModal').classList.remove('hidden');
        }

        function closeDownloadModal() {
            document.getElementById('downloadModal').classList.add('hidden');
        }

        function switchApiTab(tab) {
            document.querySelectorAll('.api-tab').forEach(t => {
                t.className = 'api-tab px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700';
            });
            document.getElementById(`tab-${tab}`).className = 'api-tab px-4 py-2 rounded-xl bg-ilove-navy text-white';

            const snippet = document.getElementById('codeSnippet');
            if (tab === 'curl') {
                snippet.innerText = `curl -X POST https://api.xconvertpro.com/v1/compress \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -F "image=@photo.jpg" \\\n  -F "quality=80"`;
            } else if (tab === 'js') {
                snippet.innerText = `const formData = new FormData();\nformData.append('image', fileInput.files[0]);\n\nconst response = await fetch('https://api.xconvertpro.com/v1/compress', {\n  method: 'POST',\n  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },\n  body: formData\n});\nconst blob = await response.blob();`;
            } else if (tab === 'python') {
                snippet.innerText = `import requests\n\nurl = 'https://api.xconvertpro.com/v1/compress'\nheaders = {'Authorization': 'Bearer YOUR_API_KEY'}\nfiles = {'image': open('photo.jpg', 'rb')}\n\nresponse = requests.post(url, headers=headers, files=files)\nwith open('output.jpg', 'wb') as f:\n    f.write(response.content)`;
            }
        }

        function openApiKeyModal() {
            document.getElementById('apiKeyModal').classList.remove('hidden');
        }

        function closeApiKeyModal() {
            document.getElementById('apiKeyModal').classList.add('hidden');
        }

        function showProCheckoutModal(planName, price) {
            showToast(`Selected ${planName} plan (${price}/mo). Payment gateway ready.`);
        }

        function copyText(id) {
            const text = document.getElementById(id).innerText;
            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showToast('Copied to clipboard!');
        }
