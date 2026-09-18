// XConvert Pro — lightweight application entry point
// Core state/navigation load immediately; heavy image-processing modules load on demand.

import { state } from './modules/state.js';
import { navigateTo, toggleDarkMode, toggleMobileMenu } from './modules/navigation.js';

const moduleCache = new Map();

function loadModule(name) {
  if (!moduleCache.has(name)) {
    moduleCache.set(name, import(`./modules/${name}.js`));
  }
  return moduleCache.get(name);
}

// Stable global wrappers preserve the existing inline HTML handlers while
// allowing the heavier feature modules to stay out of the initial load.
const lazyApi = {
  showToast: (...args) => loadModule('workspace').then(m => m.showToast(...args)),
  openToolWorkspace: (...args) => loadModule('workspace').then(m => m.openToolWorkspace(...args)),
  closeTool: (...args) => loadModule('workspace').then(m => m.closeTool(...args)),
  triggerToolUpload: (...args) => loadModule('workspace').then(m => m.triggerToolUpload(...args)),
  handleToolPageUpload: (...args) => loadModule('workspace').then(m => m.handleToolPageUpload(...args)),
  showDropzoneUI: (...args) => loadModule('workspace').then(m => m.showDropzoneUI(...args)),
  showPreviewUI: (...args) => loadModule('workspace').then(m => m.showPreviewUI(...args)),
  handleFileSelect: (...args) => loadModule('workspace').then(m => m.handleFileSelect(...args)),
  loadImageFromFile: (...args) => loadModule('workspace').then(m => m.loadImageFromFile(...args)),
  loadSampleImageAndLaunch: (...args) => loadModule('workspace').then(m => m.loadSampleImageAndLaunch(...args)),
  loadSampleImage: (...args) => loadModule('workspace').then(m => m.loadSampleImage(...args)),
  resetWorkspaceImage: (...args) => loadModule('workspace').then(m => m.resetWorkspaceImage(...args)),

  renderCanvas: (...args) => loadModule('canvas').then(m => m.renderCanvas(...args)),
  processRemoveBg: (...args) => loadModule('canvas').then(m => m.processRemoveBg(...args)),
  drawCropOverlay: (...args) => loadModule('canvas').then(m => m.drawCropOverlay(...args)),
  drawWatermarkOverlay: (...args) => loadModule('canvas').then(m => m.drawWatermarkOverlay(...args)),
  drawMemeOverlay: (...args) => loadModule('canvas').then(m => m.drawMemeOverlay(...args)),

  renderToolControls: (...args) => loadModule('controls').then(m => m.renderToolControls(...args)),
  setCompressPreset: (...args) => loadModule('controls').then(m => m.setCompressPreset(...args)),
  updateResizeDim: (...args) => loadModule('controls').then(m => m.updateResizeDim(...args)),

  processAndDownload: (...args) => loadModule('download').then(m => m.processAndDownload(...args)),
  closeDownloadModal: (...args) => loadModule('download').then(m => m.closeDownloadModal(...args)),

  switchApiTab: (...args) => loadModule('api').then(m => m.switchApiTab(...args)),
  openApiKeyModal: (...args) => loadModule('api').then(m => m.openApiKeyModal(...args)),
  closeApiKeyModal: (...args) => loadModule('api').then(m => m.closeApiKeyModal(...args)),
  showProCheckoutModal: (...args) => loadModule('api').then(m => m.showProCheckoutModal(...args)),
  copyText: (...args) => loadModule('api').then(m => m.copyText(...args))
};

Object.assign(window, {
  state,
  navigateTo,
  toggleDarkMode,
  toggleMobileMenu,
  ...lazyApi
});

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .catch((error) => console.warn('XConvert Pro service worker registration failed:', error));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  navigateTo(state.currentPage);
  registerServiceWorker();
});
