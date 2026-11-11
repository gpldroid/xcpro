// XConvert Pro — WebMCP integration
// Progressive enhancement: the site remains fully functional when WebMCP is unavailable.
const TOOL_PATHS = {
  compress: '/tools/compress-image.html',
  resize: '/tools/resize-image.html',
  crop: '/tools/crop-image.html',
  convert: '/tools/convert-image.html',
  editor: '/tools/photo-editor.html',
  removebg: '/tools/remove-background.html',
  upscale: '/tools/upscale-image.html',
  watermark: '/tools/watermark-image.html',
  meme: '/tools/meme-generator.html',
  rotate: '/tools/rotate-image.html'
};

const TOOL_LABELS = {
  compress: 'Compress Images', resize: 'Resize Images', crop: 'Crop Images',
  convert: 'Convert Images', editor: 'Photo Editor', removebg: 'Remove Background',
  upscale: 'Upscale Images', watermark: 'Watermark Images', meme: 'Meme Generator',
  rotate: 'Rotate Images'
};

const result = (text) => ({ content: [{ type: 'text', text }] });
const finite = (value, min, max, label) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(label + ' must be between ' + min + ' and ' + max + '.');
  }
  return number;
};

async function registerXConvertTools() {
  const context = document.modelContext;
  if (!context || typeof context.registerTool !== 'function') return;

  const [{ state }, workspace, controls, download, canvas] = await Promise.all([
    import('./modules/state.js'),
    import('./modules/workspace.js'),
    import('./modules/controls.js'),
    import('./modules/download.js'),
    import('./modules/canvas.js')
  ]);

  const controllers = [];
  const register = async (definition) => {
    const controller = new AbortController();
    try {
      await context.registerTool(definition, { signal: controller.signal });
      controllers.push(controller);
    } catch (error) {
      controller.abort();
      // Avoid breaking the normal website if a browser rejects experimental WebMCP.
      console.warn('XConvert Pro WebMCP tool registration skipped:', definition.name, error);
    }
  };

  await register({
    name: 'xconvert_list_image_tools',
    title: 'List image tools',
    description: 'List the image editing and conversion tools available on XConvert Pro.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => result(Object.entries(TOOL_LABELS).map(([key, label]) => key + ': ' + label).join('\n'))
  });

  await register({
    name: 'xconvert_open_image_tool',
    title: 'Open an image tool',
    description: 'Navigate to one of XConvert Pro image tools. The user must choose or upload an image in the page before processing.',
    inputSchema: {
      type: 'object',
      properties: { tool: { type: 'string', enum: Object.keys(TOOL_PATHS), description: 'Image tool identifier.' } },
      required: ['tool'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, consequentialHint: false },
    execute: ({ tool }) => {
      if (!TOOL_PATHS[tool]) throw new Error('Unsupported image tool.');
      if (document.body.dataset.tool === tool) return result(TOOL_LABELS[tool] + ' is already open.');
      window.location.assign(TOOL_PATHS[tool]);
      return result('Opening ' + TOOL_LABELS[tool] + '. Choose an image in the page to continue.');
    }
  });

  await register({
    name: 'xconvert_get_image_status',
    title: 'Get image workspace status',
    description: 'Check whether an image is loaded and return its dimensions, filename, active tool, and current editing settings. Does not read or upload image contents.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => {
      const image = state.originalImage;
      if (!image) return result('No image is loaded. Ask the user to choose an image using the visible upload control.');
      return result(JSON.stringify({
        imageLoaded: true,
        fileName: state.loadedImageName,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        activeTool: state.activeTool,
        settings: state[state.activeTool] || {}
      }));
    }
  });

  await register({
    name: 'xconvert_update_image_settings',
    title: 'Update image settings',
    description: 'Update supported settings for the currently open XConvert Pro image tool. An image must already be loaded. Only listed fields are accepted.',
    inputSchema: {
      type: 'object',
      properties: {
        quality: { type: 'number', minimum: 0.1, maximum: 1, description: 'JPEG compression quality (compress tool).' },
        width: { type: 'integer', minimum: 1, maximum: 12000, description: 'Output width in pixels (resize tool).' },
        height: { type: 'integer', minimum: 1, maximum: 12000, description: 'Output height in pixels (resize tool).' },
        percentage: { type: 'integer', minimum: 10, maximum: 200, description: 'Resize percentage (resize tool).' },
        format: { type: 'string', enum: ['jpeg', 'png', 'webp'], description: 'Output format (convert tool).' },
        brightness: { type: 'integer', minimum: 0, maximum: 200 },
        contrast: { type: 'integer', minimum: 0, maximum: 200 },
        saturation: { type: 'integer', minimum: 0, maximum: 200 },
        blur: { type: 'integer', minimum: 0, maximum: 20 },
        angle: { type: 'integer', enum: [0, 90, 180, 270] },
        scale: { type: 'integer', enum: [2, 4] },
        watermarkText: { type: 'string', maxLength: 120 },
        watermarkPosition: { type: 'string', enum: ['bottom-right', 'bottom-left', 'top-right', 'top-center', 'center'] }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, consequentialHint: false },
    execute: (input) => {
      if (!state.originalImage) throw new Error('Choose an image in the page before changing settings.');
      const key = state.activeTool;
      const s = state[key];
      if (!s) throw new Error('Open an image tool before changing settings.');
      const applied = [];
      const set = (inputKey, stateKey, min, max) => {
        if (input[inputKey] !== undefined) { s[stateKey] = finite(input[inputKey], min, max, inputKey); applied.push(inputKey); }
      };
      if (key === 'compress') set('quality', 'quality', 0.1, 1);
      else if (key === 'resize') {
        set('width', 'width', 1, 12000); set('height', 'height', 1, 12000);
        set('percentage', 'percentage', 10, 200);
      } else if (key === 'convert') {
        if (input.format !== undefined) { if (!['jpeg', 'png', 'webp'].includes(input.format)) throw new Error('Unsupported format.'); s.format = input.format; applied.push('format'); }
      } else if (key === 'editor') {
        set('brightness', 'brightness', 0, 200); set('contrast', 'contrast', 0, 200);
        set('saturation', 'saturation', 0, 200); set('blur', 'blur', 0, 20);
      } else if (key === 'rotate') {
        if (input.angle !== undefined) { s.angle = finite(input.angle, 0, 270, 'angle'); if (![0,90,180,270].includes(s.angle)) throw new Error('Angle must be 0, 90, 180 or 270.'); applied.push('angle'); }
      } else if (key === 'upscale') set('scale', 'scale', 2, 4);
      else if (key === 'watermark') {
        if (input.watermarkText !== undefined) { s.text = String(input.watermarkText).slice(0,120); applied.push('watermarkText'); }
        if (input.watermarkPosition !== undefined) {
          const allowed = ['bottom-right','bottom-left','top-right','top-center','center'];
          if (!allowed.includes(input.watermarkPosition)) throw new Error('Unsupported watermark position.');
          s.position = input.watermarkPosition; applied.push('watermarkPosition');
        }
      } else throw new Error('Settings updates are not yet exposed for this tool.');
      if (!applied.length) throw new Error('No settings applicable to the currently open tool were provided.');
      controls.renderToolControls();
      canvas.renderCanvas();
      return result('Updated ' + TOOL_LABELS[key] + ' settings: ' + applied.join(', ') + '. Review the preview before exporting.');
    }
  });

  await register({
    name: 'xconvert_prepare_image_export',
    title: 'Prepare edited image export',
    description: 'Run the currently selected image tool using its existing settings and prepare the result in XConvert Pro’s download dialog. Requires an image already loaded by the user. Does not transmit image data to a server.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    execute: () => {
      if (!state.originalImage) throw new Error('No image is loaded. Ask the user to choose an image first.');
      download.processAndDownload();
      return result('The export action was started. Check the page for the export dialog and use its Download Image control to save the file.');
    }
  });

  context.addEventListener?.('toolchange', () => {
    // Reserved for future route-aware tool registration.
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => registerXConvertTools().catch(error => console.warn('XConvert Pro WebMCP unavailable:', error)), { once: true });
} else {
  registerXConvertTools().catch(error => console.warn('XConvert Pro WebMCP unavailable:', error));
}
