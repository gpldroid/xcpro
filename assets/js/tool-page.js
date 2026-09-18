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
import { renderCanvas } from './modules/canvas.js';
import { renderToolControls } from './modules/controls.js';

const TOOL_KEY = document.body.dataset.tool;

Object.assign(window, {
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
  renderCanvas,
  renderToolControls
});

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');
  state.activeTool = TOOL_KEY;
  openToolWorkspace(TOOL_KEY);\n  document.body.style.overflow = 'auto';
});
