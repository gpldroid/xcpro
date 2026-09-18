// XConvert Pro — image loading and workspace UI
import { state, toolsMeta } from './state.js';
import { renderCanvas } from './canvas.js';
import { renderToolControls } from './controls.js';
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

export { showToast, openToolWorkspace, closeTool, triggerToolUpload, handleToolPageUpload, showDropzoneUI, showPreviewUI, handleFileSelect, loadImageFromFile, loadSampleImageAndLaunch, loadSampleImage, resetWorkspaceImage };
