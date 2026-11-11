export type ToolField = {
  key: string;
  label: string;
  type: 'range' | 'number' | 'select' | 'text' | 'toggle';
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  defaultValue: string | number | boolean;
  help?: string;
};

export type ToolDefinition = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  category: string;
  badge: string;
  output: string;
  fields: ToolField[];
  faqs: { question: string; answer: string }[];
};

const formatField: ToolField = {
  key: 'format',
  label: 'Output format',
  type: 'select',
  defaultValue: 'image/webp',
  options: [
    { label: 'WebP', value: 'image/webp' },
    { label: 'JPEG', value: 'image/jpeg' },
    { label: 'PNG', value: 'image/png' },
  ],
};

export const tools: ToolDefinition[] = [
  {
    id: 'compress',
    slug: 'compress-image',
    title: 'Compress Images Online',
    shortTitle: 'Image Compressor',
    description: 'Reduce image file size in your browser while controlling output quality.',
    summary: 'Choose an image, adjust quality, preview the result, and save a smaller file without uploading it to a server.',
    category: 'Optimize',
    badge: 'Smaller files',
    output: 'WebP, JPEG, or PNG',
    fields: [
      { key: 'quality', label: 'Image quality', type: 'range', min: 0.1, max: 1, step: 0.05, defaultValue: 0.82, help: 'Lower quality usually creates a smaller file. PNG does not use lossy quality.' },
      formatField,
    ],
    faqs: [
      { question: 'Does compression upload my image?', answer: 'No. Image decoding and encoding run in your browser. The file is not sent to an XConvert server.' },
      { question: 'Which format gives the smallest file?', answer: 'WebP is often smaller for photographic images. Compare the preview and output size for your own image.' },
      { question: 'Will compression always reduce the file size?', answer: 'No. Some images are already optimized or use efficient source formats. Try a different format or quality setting.' },
    ],
  },
  {
    id: 'resize',
    slug: 'resize-image',
    title: 'Resize Images Online',
    shortTitle: 'Image Resizer',
    description: 'Change image dimensions or scale an image by percentage.',
    summary: 'Set the output width and height, preserve proportions, and export a resized copy.',
    category: 'Optimize',
    badge: 'Exact dimensions',
    output: 'WebP, JPEG, or PNG',
    fields: [
      { key: 'width', label: 'Width (px)', type: 'number', min: 1, max: 12000, defaultValue: 1200 },
      { key: 'height', label: 'Height (px)', type: 'number', min: 1, max: 12000, defaultValue: 800 },
      { key: 'keepAspect', label: 'Keep aspect ratio', type: 'toggle', defaultValue: true },
      formatField,
    ],
    faqs: [
      { question: 'Can I resize without stretching?', answer: 'Yes. Keep aspect ratio enabled to calculate the other dimension from the original image proportions.' },
      { question: 'What is the maximum output size?', answer: 'The workspace limits each output dimension to 12,000 pixels and caps the total pixel count to protect browser memory.' },
      { question: 'Does resizing overwrite my original?', answer: 'No. The original file remains unchanged. The resized result is downloaded as a separate file.' },
    ],
  },
  {
    id: 'crop',
    slug: 'crop-image',
    title: 'Crop Images Online',
    shortTitle: 'Image Cropper',
    description: 'Crop an image using adjustable horizontal and vertical crop percentages.',
    summary: 'Set the crop area, inspect the output preview, and export only the selected image region.',
    category: 'Edit',
    badge: 'Custom crop',
    output: 'WebP, JPEG, or PNG',
    fields: [
      { key: 'cropX', label: 'Left offset (%)', type: 'range', min: 0, max: 80, step: 1, defaultValue: 0 },
      { key: 'cropY', label: 'Top offset (%)', type: 'range', min: 0, max: 80, step: 1, defaultValue: 0 },
      { key: 'cropWidth', label: 'Crop width (%)', type: 'range', min: 10, max: 100, step: 1, defaultValue: 80 },
      { key: 'cropHeight', label: 'Crop height (%)', type: 'range', min: 10, max: 100, step: 1, defaultValue: 80 },
      formatField,
    ],
    faqs: [
      { question: 'Can I position the crop area?', answer: 'Yes. Adjust the left and top offsets and the crop width and height in the controls.' },
      { question: 'Does cropping reduce image dimensions?', answer: 'Yes. The exported image contains only the selected region and uses the corresponding pixel dimensions.' },
      { question: 'Can I export a transparent crop?', answer: 'PNG preserves transparency where it exists in the selected source region.' },
    ],
  },
  {
    id: 'convert',
    slug: 'convert-image',
    title: 'Convert Image Formats',
    shortTitle: 'Image Converter',
    description: 'Convert images between WebP, JPEG, and PNG formats locally in your browser.',
    summary: 'Choose a supported output format and download a converted copy of your image.',
    category: 'Convert',
    badge: 'Format conversion',
    output: 'WebP, JPEG, or PNG',
    fields: [formatField, { key: 'quality', label: 'Quality (lossy formats)', type: 'range', min: 0.1, max: 1, step: 0.05, defaultValue: 0.9 }],
    faqs: [
      { question: 'Which formats are supported?', answer: 'The current export pipeline supports WebP, JPEG, and PNG. Browser decoding support depends on the browser and source format.' },
      { question: 'Does JPEG support transparency?', answer: 'No. Transparent pixels are flattened onto a white background when exporting JPEG.' },
      { question: 'Can conversion change quality?', answer: 'JPEG and WebP use the selected lossy quality setting. PNG export is lossless.' },
    ],
  },
  {
    id: 'editor',
    slug: 'photo-editor',
    title: 'Online Photo Editor',
    shortTitle: 'Photo Editor',
    description: 'Adjust brightness, contrast, saturation, and blur before exporting.',
    summary: 'Apply practical image adjustments in the browser and save a separate edited result.',
    category: 'Edit',
    badge: 'Quick adjustments',
    output: 'WebP, JPEG, or PNG',
    fields: [
      { key: 'brightness', label: 'Brightness', type: 'range', min: 0, max: 200, defaultValue: 100 },
      { key: 'contrast', label: 'Contrast', type: 'range', min: 0, max: 200, defaultValue: 100 },
      { key: 'saturation', label: 'Saturation', type: 'range', min: 0, max: 200, defaultValue: 100 },
      { key: 'blur', label: 'Blur (px)', type: 'range', min: 0, max: 12, defaultValue: 0 },
      formatField,
    ],
    faqs: [
      { question: 'Are edits applied to the original file?', answer: 'No. The original file is retained and edits are rendered to a new output file.' },
      { question: 'Can I undo adjustments?', answer: 'Use Reset settings to restore the default controls, then process the image again.' },
      { question: 'Are advanced layer tools included?', answer: 'This workspace provides quick global adjustments, not a full layer-based desktop editing suite.' },
    ],
  },
  {
    id: 'removebg',
    slug: 'remove-background',
    title: 'Remove a Simple Image Background',
    shortTitle: 'Background Remover',
    description: 'Remove connected background colors from the image edges using a tolerance-based browser algorithm.',
    summary: 'Best for simple, mostly uniform backgrounds. This is not an AI subject segmentation service.',
    category: 'Edit',
    badge: 'Edge-color removal',
    output: 'Transparent PNG',
    fields: [
      { key: 'tolerance', label: 'Color tolerance', type: 'range', min: 5, max: 120, defaultValue: 42, help: 'Higher tolerance removes a wider range of edge-connected colors and can affect similar subject colors.' },
    ],
    faqs: [
      { question: 'Is this an AI background remover?', answer: 'No. It uses a connected edge-color flood-fill algorithm. It does not use an AI segmentation model.' },
      { question: 'What images work best?', answer: 'Images with a flat, uniform background and clear contrast between the subject and background.' },
      { question: 'Why are some subject pixels removed?', answer: 'If subject colors are similar to the background and connected to the image edge, a high tolerance can remove them. Reduce tolerance and try again.' },
    ],
  },
  {
    id: 'upscale',
    slug: 'upscale-image',
    title: 'Upscale Images in Your Browser',
    shortTitle: 'Image Upscaler',
    description: 'Increase image dimensions using browser canvas high-quality interpolation.',
    summary: 'Create a larger raster output. This is conventional resampling, not AI detail reconstruction.',
    category: 'Optimize',
    badge: '2× / 4× resize',
    output: 'WebP, JPEG, or PNG',
    fields: [
      { key: 'scale', label: 'Scale factor', type: 'select', defaultValue: '2', options: [{ label: '2×', value: '2' }, { label: '4×', value: '4' }] },
      formatField,
      { key: 'quality', label: 'Output quality', type: 'range', min: 0.1, max: 1, step: 0.05, defaultValue: 0.92 },
    ],
    faqs: [
      { question: 'Does upscaling create new AI details?', answer: 'No. It increases pixel dimensions using the browser canvas smoothing algorithm. It cannot reliably reconstruct missing details.' },
      { question: 'Why is 4× sometimes unavailable?', answer: 'The workspace enforces browser memory and output pixel limits to avoid oversized canvas allocations.' },
      { question: 'Will the larger image look sharper?', answer: 'The output has more pixels, but enlargement cannot recover detail absent from the original.' },
    ],
  },
  {
    id: 'watermark',
    slug: 'watermark-image',
    title: 'Add a Text Watermark to Images',
    shortTitle: 'Image Watermark',
    description: 'Overlay a customizable text watermark and export a new image.',
    summary: 'Set watermark text, position, size, and opacity without changing the source file.',
    category: 'Edit',
    badge: 'Text watermark',
    output: 'WebP, JPEG, or PNG',
    fields: [
      { key: 'watermarkText', label: 'Watermark text', type: 'text', defaultValue: 'XConvert Pro' },
      { key: 'watermarkPosition', label: 'Position', type: 'select', defaultValue: 'bottom-right', options: [{ label: 'Bottom right', value: 'bottom-right' }, { label: 'Bottom left', value: 'bottom-left' }, { label: 'Top right', value: 'top-right' }, { label: 'Center', value: 'center' }] },
      { key: 'watermarkSize', label: 'Text size', type: 'range', min: 12, max: 120, defaultValue: 36 },
      { key: 'watermarkOpacity', label: 'Opacity', type: 'range', min: 10, max: 100, defaultValue: 72 },
      formatField,
    ],
    faqs: [
      { question: 'Can I move the watermark?', answer: 'Choose one of the available corner or center positions in the settings.' },
      { question: 'Can I change transparency?', answer: 'Yes. Use the opacity control to make the watermark more or less visible.' },
      { question: 'Does the watermark protect ownership?', answer: 'A visible watermark can discourage casual reuse but cannot prevent cropping, removal, or copying.' },
    ],
  },
  {
    id: 'meme',
    slug: 'meme-generator',
    title: 'Create an Image Meme',
    shortTitle: 'Meme Generator',
    description: 'Add top and bottom caption text to an image using a high-contrast meme style.',
    summary: 'Enter captions, adjust text size, preview the result, and export your meme.',
    category: 'Create',
    badge: 'Top / bottom captions',
    output: 'WebP, JPEG, or PNG',
    fields: [
      { key: 'topText', label: 'Top caption', type: 'text', defaultValue: '' },
      { key: 'bottomText', label: 'Bottom caption', type: 'text', defaultValue: '' },
      { key: 'memeSize', label: 'Caption size', type: 'range', min: 18, max: 100, defaultValue: 48 },
      formatField,
    ],
    faqs: [
      { question: 'Can I use my own image?', answer: 'Yes. Upload a local image and add top and bottom caption text.' },
      { question: 'Are captions editable after export?', answer: 'No. Captions are rasterized into the exported image. Keep the original file if you want to create another version.' },
      { question: 'Can I download a transparent meme?', answer: 'PNG can preserve transparent regions from the source image.' },
    ],
  },
  {
    id: 'rotate',
    slug: 'rotate-image',
    title: 'Rotate and Flip Images',
    shortTitle: 'Image Rotator',
    description: 'Rotate images by 90-degree increments and flip horizontally or vertically.',
    summary: 'Choose a rotation angle, optionally flip the image, preview, and save the result.',
    category: 'Edit',
    badge: 'Rotate / flip',
    output: 'WebP, JPEG, or PNG',
    fields: [
      { key: 'angle', label: 'Rotation', type: 'select', defaultValue: '90', options: [{ label: '0°', value: '0' }, { label: '90° clockwise', value: '90' }, { label: '180°', value: '180' }, { label: '270° clockwise', value: '270' }] },
      { key: 'flipH', label: 'Flip horizontally', type: 'toggle', defaultValue: false },
      { key: 'flipV', label: 'Flip vertically', type: 'toggle', defaultValue: false },
      formatField,
    ],
    faqs: [
      { question: 'Can I rotate by 90 degrees?', answer: 'Yes. Choose 0, 90, 180, or 270 degrees.' },
      { question: 'Will portrait images remain portrait?', answer: 'A 90- or 270-degree rotation swaps output width and height.' },
      { question: 'Does rotation overwrite the original?', answer: 'No. The transformed image is exported as a separate file.' },
    ],
  },
];

export const getToolBySlug = (slug: string) => tools.find((tool) => tool.slug === slug);
export const getToolById = (id: string) => tools.find((tool) => tool.id === id);
