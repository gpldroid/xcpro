// XConvert Pro — standalone tool page entry
import { state } from './modules/state.js';
import { toggleDarkMode, toggleMobileMenu } from './modules/navigation.js';
import {
  openToolWorkspace,
  closeTool,
  showToast,
  handleFileSelect,
  loadSampleImage,
  resetWorkspaceImage
} from './modules/workspace.js';
import { processAndDownload, closeDownloadModal } from './modules/download.js';
import { renderCanvas, initCropInteraction } from './modules/canvas.js';
import { renderToolControls, setCompressPreset, updateResizeDim } from './modules/controls.js';

const TOOL_KEY = document.body.dataset.tool;

Object.assign(window, {
  state,
  toggleDarkMode,
  toggleMobileMenu,
  openToolWorkspace,
  closeTool,
  showToast,
  handleFileSelect,
  loadSampleImage,
  resetWorkspaceImage,
  processAndDownload,
  closeDownloadModal,
  renderCanvas,\n  initCropInteraction,
  renderToolControls,
  setCompressPreset,
  updateResizeDim
});

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/xcpro/sw.js', { scope: '/xcpro/' })
      .catch((error) => console.warn('XConvert Pro service worker registration failed:', error));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');
  state.activeTool = TOOL_KEY;
  openToolWorkspace(TOOL_KEY);
  document.body.style.overflow = 'auto';\n  initCropInteraction();
  registerServiceWorker();
});
