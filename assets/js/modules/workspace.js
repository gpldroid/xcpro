// XConvert Pro — image loading and workspace UI
import { state, toolsMeta } from './state.js';
import { renderCanvas } from './canvas.js';
import { renderToolControls } from './controls.js';
function showToast(msg) {
            const toast = document.getElementById('toast');
            const message = document.getElementById('toastMsg');
            if (!toast || !message) {
                console.warn('XConvert Pro notice:', msg);
                return;
            }
            message.textContent = msg;
            toast.classList.remove('hidden');
            window.clearTimeout(showToast.timeoutId);
            showToast.timeoutId = window.setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }

function openToolWorkspace(toolKey) {
            state.activeTool = toolKey || state.activeTool;
            const meta = toolsMeta[state.activeTool] || toolsMeta.compress;
            
            document.getElementById('activeToolTitle').innerText = meta.title;
            document.getElementById('activeToolDesc').innerText = meta.desc;
            const icon = document.getElementById('activeToolIcon');
            icon.className = 'text-ilove-brandBlue text-2xl';
            icon.textContent = meta.icon;
            icon.setAttribute('aria-hidden', 'true');
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
            if (document.body.dataset.tool) {
                window.location.href = '/';
                return;
            }
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
            if (!file) return;
            if (file.type && !file.type.startsWith('image/')) {
                showToast('Please choose a valid image file.');
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const img = new Image();
            let released = false;
            const releaseUrl = () => {
                if (released) return;
                URL.revokeObjectURL(objectUrl);
                released = true;
            };

            img.onload = function() {
                releaseUrl();
                state.loadedImageName = file.name || 'image.jpg';
                state.originalFileSize = file.size || 0;
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
            img.onerror = function() {
                releaseUrl();
                showToast('This image could not be opened. Try another image file.');
            };
            img.src = objectUrl;
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
            state.compress = { quality: 0.70 };
            state.resize = { width: state.originalImage.width, height: state.originalImage.height, lockAspect: true, percentage: 80, mode: 'pixels' };
            state.crop = { x: 10, y: 10, width: 80, height: 80 };
            state.convert = { format: 'jpeg', quality: 0.9 };
            state.editor = { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 };
            state.removebg = { tolerance: 30 };
            state.upscale = { scale: 2 };
            state.watermark = { text: '© XConvert Pro', fontSize: 36, opacity: 0.7, color: '#ffffff', position: 'bottom-right' };
            state.meme = { topText: 'WHEN YOU USE', bottomText: 'XCONVERT PRO FOR YOUR PHOTOS', fontSize: 42, textColor: '#ffffff' };
            state.rotate = { angle: 0, flipH: false, flipV: false };
            renderToolControls();
            renderCanvas();
        }

export { showToast, openToolWorkspace, closeTool, triggerToolUpload, handleToolPageUpload, showDropzoneUI, showPreviewUI, handleFileSelect, loadImageFromFile, loadSampleImageAndLaunch, loadSampleImage, resetWorkspaceImage };
