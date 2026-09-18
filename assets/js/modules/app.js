// XConvert Pro — application entry point
import { state } from './modules/state.js';
import { navigateTo, toggleDarkMode, toggleMobileMenu } from './modules/navigation.js';
import { showToast, openToolWorkspace, closeTool, triggerToolUpload, handleToolPageUpload, showDropzoneUI, showPreviewUI, handleFileSelect, loadImageFromFile, loadSampleImageAndLaunch, loadSampleImage, resetWorkspaceImage } from './modules/workspace.js';
import { renderCanvas, processRemoveBg, drawCropOverlay, drawWatermarkOverlay, drawMemeOverlay } from './modules/canvas.js';
import { renderToolControls, setCompressPreset, updateResizeDim } from './modules/controls.js';
import { processAndDownload, closeDownloadModal } from './modules/download.js';
import { switchApiTab, openApiKeyModal, closeApiKeyModal, showProCheckoutModal, copyText } from './modules/api.js';

const publicApi = {
  state,
  navigateTo,
  toggleDarkMode,
  toggleMobileMenu,
  showToast,
  openToolWorkspace,
  closeTool,
  triggerToolUpload,
  handleToolPageUpload,
  showDropzoneUI,
  showPreviewUI,
  handleFileSelect,
  loadImageFromFile,
  loadSampleImageAndLaunch,
  loadSampleImage,
  resetWorkspaceImage,
  renderCanvas,
  processRemoveBg,
  drawCropOverlay,
  drawWatermarkOverlay,
  drawMemeOverlay,
  renderToolControls,
  setCompressPreset,
  updateResizeDim,
  processAndDownload,
  closeDownloadModal,
  switchApiTab,
  openApiKeyModal,
  closeApiKeyModal,
  showProCheckoutModal,
  copyText
};

Object.assign(window, publicApi);

document.addEventListener('DOMContentLoaded', () => {
  // Keep the initial home view deterministic.
  navigateTo(state.currentPage);
});
