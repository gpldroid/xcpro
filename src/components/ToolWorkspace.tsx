import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { useWebMCP } from 'use-webmcp-tool';
import type { ToolDefinition, ToolField } from '../data/tools';
import { processImageFile, validateImageFile, type ProcessResult } from '../features/image-engine/client';
import { formatBytes, type ImageSettings } from '../features/image-engine/math';

type Props = { tool: ToolDefinition };
type AgentSettings = Record<string, unknown>;

function defaults(tool: ToolDefinition): ImageSettings {
  return Object.fromEntries(tool.fields.map((field) => [field.key, field.defaultValue]));
}

function validateAgentSettings(tool: ToolDefinition, input: AgentSettings): ImageSettings {
  const fields = new Map(tool.fields.map((field) => [field.key, field]));
  const updates: ImageSettings = {};
  for (const [key, value] of Object.entries(input)) {
    const field = fields.get(key);
    if (!field) throw new Error(`The ${key} setting is not available in this tool.`);
    if (field.type === 'toggle') {
      if (typeof value !== 'boolean') throw new Error(`${field.label} must be true or false.`);
      updates[key] = value;
    } else if (field.type === 'text') {
      if (typeof value !== 'string') throw new Error(`${field.label} must be text.`);
      updates[key] = value.slice(0, 120);
    } else if (field.type === 'color') {
      if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${field.label} must be a six-digit hex color.`);
      updates[key] = value;
    } else if (field.type === 'select') {
      if (typeof value !== 'string' || !field.options?.some((option) => option.value === value)) throw new Error(`Choose a valid value for ${field.label}.`);
      updates[key] = value;
    } else {
      const number = Number(value);
      if (!Number.isFinite(number) || (field.min !== undefined && number < field.min) || (field.max !== undefined && number > field.max)) throw new Error(`${field.label} is outside the allowed range.`);
      updates[key] = number;
    }
  }
  if (!Object.keys(updates).length) throw new Error('Provide at least one setting to update.');
  return updates;
}

function FieldControl({ field, value, onChange }: { field: ToolField; value: string | number | boolean; onChange: (value: string | number | boolean) => void }) {
  if (field.type === 'toggle') return <label className="control control--toggle"><span>{field.label}</span><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /></label>;
  if (field.type === 'select') return <label className="control"><span>{field.label}</span><select value={String(value)} onChange={(event) => onChange(event.target.value)}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  if (field.type === 'text') return <label className="control"><span>{field.label}</span><input type="text" maxLength={120} value={String(value)} onChange={(event) => onChange(event.target.value)} /></label>;
  if (field.type === 'color') return <label className="control"><span>{field.label}</span><input type="color" value={String(value)} onChange={(event) => onChange(event.target.value)} /></label>;
  if (field.type === 'range') return <label className="control"><span className="control__label"><span>{field.label}</span><output>{String(value)}</output></span><input type="range" min={field.min} max={field.max} step={field.step ?? 1} value={Number(value)} onChange={(event) => onChange(Number(event.target.value))} />{field.help && <small>{field.help}</small>}</label>;
  return <label className="control"><span>{field.label}</span><input type="number" min={field.min} max={field.max} value={Number(value)} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export default function ToolWorkspace({ tool }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const settingsRef = useRef<ImageSettings>(defaults(tool));
  const [settings, setSettings] = useState<ImageSettings>(() => defaults(tool));
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dragging, setDragging] = useState(false);
  const [compare, setCompare] = useState(false);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [sourceUrl, resultUrl]);

  const resetResult = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    setResult(null);
    setNotice('');
  }, [resultUrl]);

  const acceptFile = useCallback((nextFile: File) => {
    try {
      validateImageFile(nextFile);
      const nextUrl = URL.createObjectURL(nextFile);
      setSourceUrl((old) => { if (old) URL.revokeObjectURL(old); return nextUrl; });
      setFile(nextFile);
      fileRef.current = nextFile;
      resetResult();
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open this image.');
    }
  }, [resetResult]);

  const runProcessing = useCallback(async (signal?: AbortSignal) => {
    const activeFile = fileRef.current;
    if (!activeFile) throw new Error('Choose an image before processing.');
    setBusy(true);
    setError('');
    try {
      const output = await processImageFile(activeFile, tool.id, settingsRef.current, signal);
      const nextUrl = URL.createObjectURL(output.blob);
      setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return nextUrl; });
      setResult(output);
      setNotice(`Processed ${output.width.toLocaleString()} × ${output.height.toLocaleString()} px. ${output.usedWorker ? 'Background worker used.' : 'Compatibility processing used.'}`);
      return { fileName: output.fileName, size: formatBytes(output.blob.size), type: output.blob.type, width: output.width, height: output.height, worker: output.usedWorker };
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image processing failed.');
      throw cause;
    } finally {
      setBusy(false);
    }
  }, [tool.id]);

  const statusTool = useWebMCP({
    name: 'xconvert_get_image_status',
    description: 'Read the current image workspace status, selected filename, file size, active tool, and settings. Does not read image pixels or upload content.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => fileRef.current
      ? { imageLoaded: true, fileName: fileRef.current.name, fileSize: fileRef.current.size, activeTool: tool.id, settings: settingsRef.current, processed: Boolean(result) }
      : { imageLoaded: false, activeTool: tool.id, message: 'No image selected. Ask the user to choose a local image first.' },
  });

  const updateTool = useWebMCP({
    name: 'xconvert_update_image_settings',
    description: `Update supported settings in the current ${tool.shortTitle} workspace. A local image must already be selected. Changes update controls but do not export automatically.`,
    inputSchema: {
      type: 'object',
      properties: {
        quality: { type: 'number', minimum: 0.1, maximum: 1 },
        width: { type: 'number', minimum: 1, maximum: 12000 },
        height: { type: 'number', minimum: 1, maximum: 12000 },
        mode: { type: 'string', enum: ['pixels', 'percentage'] },
        percentage: { type: 'number', minimum: 10, maximum: 200 },
        keepAspect: { type: 'boolean' },
        cropX: { type: 'number', minimum: 0, maximum: 80 },
        cropY: { type: 'number', minimum: 0, maximum: 80 },
        cropWidth: { type: 'number', minimum: 10, maximum: 100 },
        cropHeight: { type: 'number', minimum: 10, maximum: 100 },
        format: { type: 'string', enum: ['image/webp', 'image/jpeg', 'image/png'] },
        brightness: { type: 'number', minimum: 0, maximum: 200 },
        contrast: { type: 'number', minimum: 0, maximum: 200 },
        saturation: { type: 'number', minimum: 0, maximum: 200 },
        blur: { type: 'number', minimum: 0, maximum: 20 },
        grayscale: { type: 'number', minimum: 0, maximum: 100 },
        sepia: { type: 'number', minimum: 0, maximum: 100 },
        hue: { type: 'number', minimum: 0, maximum: 360 },
        tolerance: { type: 'number', minimum: 5, maximum: 80 },
        scale: { type: 'string', enum: ['2', '4'] },
        watermarkText: { type: 'string', maxLength: 120 },
        watermarkColor: { type: 'string', maxLength: 7 },
        watermarkPosition: { type: 'string', enum: ['bottom-right', 'bottom-left', 'top-right', 'top-center', 'center'] },
        watermarkSize: { type: 'number', minimum: 12, maximum: 120 },
        watermarkOpacity: { type: 'number', minimum: 10, maximum: 100 },
        topText: { type: 'string', maxLength: 100 },
        bottomText: { type: 'string', maxLength: 100 },
        memeSize: { type: 'number', minimum: 18, maximum: 100 },
        memeColor: { type: 'string', maxLength: 7 },
        angle: { type: 'string', enum: ['0', '90', '180', '270'] },
        flipH: { type: 'boolean' },
        flipV: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, consequentialHint: false },
    enabled: Boolean(file) && !busy,
    execute: (input) => {
      if (!fileRef.current) throw new Error('Choose an image in the workspace before changing settings.');
      const updates = validateAgentSettings(tool, input as AgentSettings);
      const next = { ...settingsRef.current, ...updates };
      settingsRef.current = next;
      setSettings(next);
      resetResult();
      return { updated: Object.keys(updates), settings: next, previewRequired: true };
    },
  });

  const processTool = useWebMCP({
    name: 'xconvert_process_current_image',
    description: `Process the image already selected by the user in the ${tool.shortTitle} workspace. It creates a local preview and does not download or transmit image data.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const prepareExportTool = useWebMCP({
    name: 'xconvert_prepare_image_export',
    description: 'Prepare the currently selected image tool output for review. The user must still activate the Download image link to save it.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const fields = useMemo(() => tool.fields.map((field) => (
    <FieldControl key={field.key} field={field} value={settings[field.key] ?? field.defaultValue} onChange={(value) => {
      setSettings((current) => {
        const next = { ...current, [field.key]: value };
        settingsRef.current = next;
        return next;
      });
    }} />
  )), [settings, tool.fields]);

  function resetSettings() {
    const next = defaults(tool);
    setSettings(next);
    settingsRef.current = next;
    resetResult();
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) acceptFile(dropped);
  }

  async function loadSampleImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 640;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('The browser could not create a sample image.');
      return;
    }
    const gradient = context.createLinearGradient(0, 0, 960, 640);
    gradient.addColorStop(0, '#172554');
    gradient.addColorStop(0.55, '#0284c7');
    gradient.addColorStop(1, '#0f766e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 960, 640);
    context.fillStyle = 'rgba(255,255,255,.12)';
    context.beginPath();
    context.arc(260, 320, 210, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    context.font = '700 48px system-ui, sans-serif';
    context.textAlign = 'center';
    context.fillText('XConvert Pro Sample', 480, 335);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) {
      setError('The browser could not generate a sample image.');
      return;
    }
    acceptFile(new File([blob], 'xconvert-sample.jpg', { type: 'image/jpeg' }));
  }

  return (
    <div className="workspace">
      <div className="workspace__top"><div><span className="eyebrow">PRIVATE BROWSER WORKSPACE</span><h2>{tool.shortTitle}</h2><p>{tool.summary}</p></div>{file && <button className="button button--quiet" type="button" onClick={() => inputRef.current?.click()}>Replace image</button>}</div>
      <input ref={inputRef} className="sr-only" type="file" aria-label="Choose an image file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) acceptFile(selected); event.currentTarget.value = ''; }} />
      {!file ? (
        <div className={`upload-zone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          <div className="upload-zone__icon" aria-hidden="true">↥</div><h3>Drop an image here</h3><p>Or select a file from your device. Files stay in this browser session.</p>
          <div className="hero-actions"><button type="button" className="button button--primary" onClick={() => inputRef.current?.click()}>Choose image</button><button type="button" className="button button--quiet" onClick={() => void loadSampleImage()}>Use sample image</button></div>
          <small>PNG, JPEG, WebP, AVIF, GIF or BMP · Up to 40 MB</small>
        </div>
      ) : (
        <div className="workspace__grid">
          <section className="preview-panel" aria-label="Image preview"><div className="preview-panel__bar"><span>{result ? 'Processed result' : 'Original image'}</span><div className="preview-panel__actions">{result && <button type="button" className="text-button" onClick={() => setCompare((value) => !value)} aria-pressed={compare}>{compare ? 'Show result' : 'Compare original'}</button>}<button type="button" className="text-button" onClick={resetResult}>Reset preview</button></div></div><div className="preview-panel__image"><img src={compare ? sourceUrl : resultUrl || sourceUrl} alt={compare ? 'Original uploaded image' : result ? 'Processed image preview' : 'Original uploaded image'} /></div><div className="file-meta"><span>{file.name}</span><span>{formatBytes(file.size)}</span>{result && <span>Output: {formatBytes(result.blob.size)}</span>}</div></section>
          <aside className="settings-panel" aria-label="Image settings"><div className="settings-panel__heading"><h3>Adjust settings</h3><button type="button" className="text-button" onClick={resetSettings}>Reset</button></div><div className="settings-fields">{fields}</div><button type="button" className="button button--primary button--wide" disabled={busy} onClick={() => void runProcessing().catch(() => {})}>{busy ? 'Processing image…' : 'Apply and preview'}</button>{result && <a className="button button--secondary button--wide" href={resultUrl} download={result.fileName}>Download image</a>}<p className="privacy-note">Your image is processed locally. Nothing is uploaded by this tool.</p></aside>
        </div>
      )}
      <div className="workspace__status" aria-live="polite">{busy && <span className="status status--working">Processing in your browser…</span>}{notice && !busy && <span className="status status--success">{notice}</span>}{error && <span className="status status--error">{error}</span>}{statusTool.supported && statusTool.registered && <span className="status status--agent">Browser agent tools available</span>}{updateTool.error && <span className="status status--error">Agent settings tool unavailable.</span>}{processTool.error && <span className="status status--error">Agent processing tool unavailable.</span>}{prepareExportTool.error && <span className="status status--error">Agent export tool unavailable.</span>}</div>
    </div>
  );
}
 },
        watermarkPosition: { type: 'string', enum: ['bottom-right', 'bottom-left', 'top-right', 'top-center', 'center'] },
        watermarkSize: { type: 'number', minimum: 12, maximum: 120 },
        watermarkOpacity: { type: 'number', minimum: 10, maximum: 100 },
        topText: { type: 'string', maxLength: 100 },
        bottomText: { type: 'string', maxLength: 100 },
        memeSize: { type: 'number', minimum: 18, maximum: 100 },
        memeColor: { type: 'string', maxLength: 40 },
        angle: { type: 'string', enum: ['0', '90', '180', '270'] },
        flipH: { type: 'boolean' },
        flipV: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, consequentialHint: false },
    enabled: Boolean(file) && !busy,
    execute: (input) => {
      if (!fileRef.current) throw new Error('Choose an image in the workspace before changing settings.');
      const updates = validateAgentSettings(tool, input as AgentSettings);
      const next = { ...settingsRef.current, ...updates };
      settingsRef.current = next;
      setSettings(next);
      resetResult();
      return { updated: Object.keys(updates), settings: next, previewRequired: true };
    },
  });

  const processTool = useWebMCP({
    name: 'xconvert_process_current_image',
    description: `Process the image already selected by the user in the ${tool.shortTitle} workspace. It creates a local preview and does not download or transmit image data.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const prepareExportTool = useWebMCP({
    name: 'xconvert_prepare_image_export',
    description: 'Prepare the currently selected image tool output for review. The user must still activate the Download image link to save it.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const fields = useMemo(() => tool.fields.map((field) => (
    <FieldControl key={field.key} field={field} value={settings[field.key] ?? field.defaultValue} onChange={(value) => {
      setSettings((current) => {
        const next = { ...current, [field.key]: value };
        settingsRef.current = next;
        return next;
      });
    }} />
  )), [settings, tool.fields]);

  function resetSettings() {
    const next = defaults(tool);
    setSettings(next);
    settingsRef.current = next;
    resetResult();
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) acceptFile(dropped);
  }

  async function loadSampleImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 640;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('The browser could not create a sample image.');
      return;
    }
    const gradient = context.createLinearGradient(0, 0, 960, 640);
    gradient.addColorStop(0, '#172554');
    gradient.addColorStop(0.55, '#0284c7');
    gradient.addColorStop(1, '#0f766e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 960, 640);
    context.fillStyle = 'rgba(255,255,255,.12)';
    context.beginPath();
    context.arc(260, 320, 210, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    context.font = '700 48px system-ui, sans-serif';
    context.textAlign = 'center';
    context.fillText('XConvert Pro Sample', 480, 335);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) {
      setError('The browser could not generate a sample image.');
      return;
    }
    acceptFile(new File([blob], 'xconvert-sample.jpg', { type: 'image/jpeg' }));
  }

  return (
    <div className="workspace">
      <div className="workspace__top"><div><span className="eyebrow">PRIVATE BROWSER WORKSPACE</span><h2>{tool.shortTitle}</h2><p>{tool.summary}</p></div>{file && <button className="button button--quiet" type="button" onClick={() => inputRef.current?.click()}>Replace image</button>}</div>
      <input ref={inputRef} className="sr-only" type="file" aria-label="Choose an image file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) acceptFile(selected); event.currentTarget.value = ''; }} />
      {!file ? (
        <div className={`upload-zone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          <div className="upload-zone__icon" aria-hidden="true">↥</div><h3>Drop an image here</h3><p>Or select a file from your device. Files stay in this browser session.</p>
          <div className="hero-actions"><button type="button" className="button button--primary" onClick={() => inputRef.current?.click()}>Choose image</button><button type="button" className="button button--quiet" onClick={() => void loadSampleImage()}>Use sample image</button></div>
          <small>PNG, JPEG, WebP, AVIF, GIF or BMP · Up to 40 MB</small>
        </div>
      ) : (
        <div className="workspace__grid">
          <section className="preview-panel" aria-label="Image preview"><div className="preview-panel__bar"><span>{result ? 'Processed result' : 'Original image'}</span><div className="preview-panel__actions">{result && <button type="button" className="text-button" onClick={() => setCompare((value) => !value)} aria-pressed={compare}>{compare ? 'Show result' : 'Compare original'}</button>}<button type="button" className="text-button" onClick={resetResult}>Reset preview</button></div></div><div className="preview-panel__image"><img src={compare ? sourceUrl : resultUrl || sourceUrl} alt={compare ? 'Original uploaded image' : result ? 'Processed image preview' : 'Original uploaded image'} /></div><div className="file-meta"><span>{file.name}</span><span>{formatBytes(file.size)}</span>{result && <span>Output: {formatBytes(result.blob.size)}</span>}</div></section>
          <aside className="settings-panel" aria-label="Image settings"><div className="settings-panel__heading"><h3>Adjust settings</h3><button type="button" className="text-button" onClick={resetSettings}>Reset</button></div><div className="settings-fields">{fields}</div><button type="button" className="button button--primary button--wide" disabled={busy} onClick={() => void runProcessing().catch(() => {})}>{busy ? 'Processing image…' : 'Apply and preview'}</button>{result && <a className="button button--secondary button--wide" href={resultUrl} download={result.fileName}>Download image</a>}<p className="privacy-note">Your image is processed locally. Nothing is uploaded by this tool.</p></aside>
        </div>
      )}
      <div className="workspace__status" aria-live="polite">{busy && <span className="status status--working">Processing in your browser…</span>}{notice && !busy && <span className="status status--success">{notice}</span>}{error && <span className="status status--error">{error}</span>}{statusTool.supported && statusTool.registered && <span className="status status--agent">Browser agent tools available</span>}{updateTool.error && <span className="status status--error">Agent settings tool unavailable.</span>}{processTool.error && <span className="status status--error">Agent processing tool unavailable.</span>}{prepareExportTool.error && <span className="status status--error">Agent export tool unavailable.</span>}</div>
    </div>
  );
}
 },
        angle: { type: 'string', enum: ['0', '90', '180', '270'] },
        flipH: { type: 'boolean' },
        flipV: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, consequentialHint: false },
    enabled: Boolean(file) && !busy,
    execute: (input) => {
      if (!fileRef.current) throw new Error('Choose an image in the workspace before changing settings.');
      const updates = validateAgentSettings(tool, input as AgentSettings);
      const next = { ...settingsRef.current, ...updates };
      settingsRef.current = next;
      setSettings(next);
      resetResult();
      return { updated: Object.keys(updates), settings: next, previewRequired: true };
    },
  });

  const processTool = useWebMCP({
    name: 'xconvert_process_current_image',
    description: `Process the image already selected by the user in the ${tool.shortTitle} workspace. It creates a local preview and does not download or transmit image data.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const prepareExportTool = useWebMCP({
    name: 'xconvert_prepare_image_export',
    description: 'Prepare the currently selected image tool output for review. The user must still activate the Download image link to save it.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const fields = useMemo(() => tool.fields.map((field) => (
    <FieldControl key={field.key} field={field} value={settings[field.key] ?? field.defaultValue} onChange={(value) => {
      setSettings((current) => {
        const next = { ...current, [field.key]: value };
        settingsRef.current = next;
        return next;
      });
    }} />
  )), [settings, tool.fields]);

  function resetSettings() {
    const next = defaults(tool);
    setSettings(next);
    settingsRef.current = next;
    resetResult();
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) acceptFile(dropped);
  }

  async function loadSampleImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 640;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('The browser could not create a sample image.');
      return;
    }
    const gradient = context.createLinearGradient(0, 0, 960, 640);
    gradient.addColorStop(0, '#172554');
    gradient.addColorStop(0.55, '#0284c7');
    gradient.addColorStop(1, '#0f766e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 960, 640);
    context.fillStyle = 'rgba(255,255,255,.12)';
    context.beginPath();
    context.arc(260, 320, 210, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    context.font = '700 48px system-ui, sans-serif';
    context.textAlign = 'center';
    context.fillText('XConvert Pro Sample', 480, 335);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) {
      setError('The browser could not generate a sample image.');
      return;
    }
    acceptFile(new File([blob], 'xconvert-sample.jpg', { type: 'image/jpeg' }));
  }

  return (
    <div className="workspace">
      <div className="workspace__top"><div><span className="eyebrow">PRIVATE BROWSER WORKSPACE</span><h2>{tool.shortTitle}</h2><p>{tool.summary}</p></div>{file && <button className="button button--quiet" type="button" onClick={() => inputRef.current?.click()}>Replace image</button>}</div>
      <input ref={inputRef} className="sr-only" type="file" aria-label="Choose an image file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) acceptFile(selected); event.currentTarget.value = ''; }} />
      {!file ? (
        <div className={`upload-zone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          <div className="upload-zone__icon" aria-hidden="true">↥</div><h3>Drop an image here</h3><p>Or select a file from your device. Files stay in this browser session.</p>
          <div className="hero-actions"><button type="button" className="button button--primary" onClick={() => inputRef.current?.click()}>Choose image</button><button type="button" className="button button--quiet" onClick={() => void loadSampleImage()}>Use sample image</button></div>
          <small>PNG, JPEG, WebP, AVIF, GIF or BMP · Up to 40 MB</small>
        </div>
      ) : (
        <div className="workspace__grid">
          <section className="preview-panel" aria-label="Image preview"><div className="preview-panel__bar"><span>{result ? 'Processed result' : 'Original image'}</span><div className="preview-panel__actions">{result && <button type="button" className="text-button" onClick={() => setCompare((value) => !value)} aria-pressed={compare}>{compare ? 'Show result' : 'Compare original'}</button>}<button type="button" className="text-button" onClick={resetResult}>Reset preview</button></div></div><div className="preview-panel__image"><img src={compare ? sourceUrl : resultUrl || sourceUrl} alt={compare ? 'Original uploaded image' : result ? 'Processed image preview' : 'Original uploaded image'} /></div><div className="file-meta"><span>{file.name}</span><span>{formatBytes(file.size)}</span>{result && <span>Output: {formatBytes(result.blob.size)}</span>}</div></section>
          <aside className="settings-panel" aria-label="Image settings"><div className="settings-panel__heading"><h3>Adjust settings</h3><button type="button" className="text-button" onClick={resetSettings}>Reset</button></div><div className="settings-fields">{fields}</div><button type="button" className="button button--primary button--wide" disabled={busy} onClick={() => void runProcessing().catch(() => {})}>{busy ? 'Processing image…' : 'Apply and preview'}</button>{result && <a className="button button--secondary button--wide" href={resultUrl} download={result.fileName}>Download image</a>}<p className="privacy-note">Your image is processed locally. Nothing is uploaded by this tool.</p></aside>
        </div>
      )}
      <div className="workspace__status" aria-live="polite">{busy && <span className="status status--working">Processing in your browser…</span>}{notice && !busy && <span className="status status--success">{notice}</span>}{error && <span className="status status--error">{error}</span>}{statusTool.supported && statusTool.registered && <span className="status status--agent">Browser agent tools available</span>}{updateTool.error && <span className="status status--error">Agent settings tool unavailable.</span>}{processTool.error && <span className="status status--error">Agent processing tool unavailable.</span>}{prepareExportTool.error && <span className="status status--error">Agent export tool unavailable.</span>}</div>
    </div>
  );
}
 },
        watermarkPosition: { type: 'string', enum: ['bottom-right', 'bottom-left', 'top-right', 'top-center', 'center'] },
        watermarkSize: { type: 'number', minimum: 12, maximum: 120 },
        watermarkOpacity: { type: 'number', minimum: 10, maximum: 100 },
        topText: { type: 'string', maxLength: 100 },
        bottomText: { type: 'string', maxLength: 100 },
        memeSize: { type: 'number', minimum: 18, maximum: 100 },
        memeColor: { type: 'string', maxLength: 40 },
        angle: { type: 'string', enum: ['0', '90', '180', '270'] },
        flipH: { type: 'boolean' },
        flipV: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, consequentialHint: false },
    enabled: Boolean(file) && !busy,
    execute: (input) => {
      if (!fileRef.current) throw new Error('Choose an image in the workspace before changing settings.');
      const updates = validateAgentSettings(tool, input as AgentSettings);
      const next = { ...settingsRef.current, ...updates };
      settingsRef.current = next;
      setSettings(next);
      resetResult();
      return { updated: Object.keys(updates), settings: next, previewRequired: true };
    },
  });

  const processTool = useWebMCP({
    name: 'xconvert_process_current_image',
    description: `Process the image already selected by the user in the ${tool.shortTitle} workspace. It creates a local preview and does not download or transmit image data.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const prepareExportTool = useWebMCP({
    name: 'xconvert_prepare_image_export',
    description: 'Prepare the currently selected image tool output for review. The user must still activate the Download image link to save it.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const fields = useMemo(() => tool.fields.map((field) => (
    <FieldControl key={field.key} field={field} value={settings[field.key] ?? field.defaultValue} onChange={(value) => {
      setSettings((current) => {
        const next = { ...current, [field.key]: value };
        settingsRef.current = next;
        return next;
      });
    }} />
  )), [settings, tool.fields]);

  function resetSettings() {
    const next = defaults(tool);
    setSettings(next);
    settingsRef.current = next;
    resetResult();
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) acceptFile(dropped);
  }

  async function loadSampleImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 640;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('The browser could not create a sample image.');
      return;
    }
    const gradient = context.createLinearGradient(0, 0, 960, 640);
    gradient.addColorStop(0, '#172554');
    gradient.addColorStop(0.55, '#0284c7');
    gradient.addColorStop(1, '#0f766e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 960, 640);
    context.fillStyle = 'rgba(255,255,255,.12)';
    context.beginPath();
    context.arc(260, 320, 210, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    context.font = '700 48px system-ui, sans-serif';
    context.textAlign = 'center';
    context.fillText('XConvert Pro Sample', 480, 335);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) {
      setError('The browser could not generate a sample image.');
      return;
    }
    acceptFile(new File([blob], 'xconvert-sample.jpg', { type: 'image/jpeg' }));
  }

  return (
    <div className="workspace">
      <div className="workspace__top"><div><span className="eyebrow">PRIVATE BROWSER WORKSPACE</span><h2>{tool.shortTitle}</h2><p>{tool.summary}</p></div>{file && <button className="button button--quiet" type="button" onClick={() => inputRef.current?.click()}>Replace image</button>}</div>
      <input ref={inputRef} className="sr-only" type="file" aria-label="Choose an image file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) acceptFile(selected); event.currentTarget.value = ''; }} />
      {!file ? (
        <div className={`upload-zone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          <div className="upload-zone__icon" aria-hidden="true">↥</div><h3>Drop an image here</h3><p>Or select a file from your device. Files stay in this browser session.</p>
          <div className="hero-actions"><button type="button" className="button button--primary" onClick={() => inputRef.current?.click()}>Choose image</button><button type="button" className="button button--quiet" onClick={() => void loadSampleImage()}>Use sample image</button></div>
          <small>PNG, JPEG, WebP, AVIF, GIF or BMP · Up to 40 MB</small>
        </div>
      ) : (
        <div className="workspace__grid">
          <section className="preview-panel" aria-label="Image preview"><div className="preview-panel__bar"><span>{result ? 'Processed result' : 'Original image'}</span><div className="preview-panel__actions">{result && <button type="button" className="text-button" onClick={() => setCompare((value) => !value)} aria-pressed={compare}>{compare ? 'Show result' : 'Compare original'}</button>}<button type="button" className="text-button" onClick={resetResult}>Reset preview</button></div></div><div className="preview-panel__image"><img src={compare ? sourceUrl : resultUrl || sourceUrl} alt={compare ? 'Original uploaded image' : result ? 'Processed image preview' : 'Original uploaded image'} /></div><div className="file-meta"><span>{file.name}</span><span>{formatBytes(file.size)}</span>{result && <span>Output: {formatBytes(result.blob.size)}</span>}</div></section>
          <aside className="settings-panel" aria-label="Image settings"><div className="settings-panel__heading"><h3>Adjust settings</h3><button type="button" className="text-button" onClick={resetSettings}>Reset</button></div><div className="settings-fields">{fields}</div><button type="button" className="button button--primary button--wide" disabled={busy} onClick={() => void runProcessing().catch(() => {})}>{busy ? 'Processing image…' : 'Apply and preview'}</button>{result && <a className="button button--secondary button--wide" href={resultUrl} download={result.fileName}>Download image</a>}<p className="privacy-note">Your image is processed locally. Nothing is uploaded by this tool.</p></aside>
        </div>
      )}
      <div className="workspace__status" aria-live="polite">{busy && <span className="status status--working">Processing in your browser…</span>}{notice && !busy && <span className="status status--success">{notice}</span>}{error && <span className="status status--error">{error}</span>}{statusTool.supported && statusTool.registered && <span className="status status--agent">Browser agent tools available</span>}{updateTool.error && <span className="status status--error">Agent settings tool unavailable.</span>}{processTool.error && <span className="status status--error">Agent processing tool unavailable.</span>}{prepareExportTool.error && <span className="status status--error">Agent export tool unavailable.</span>}</div>
    </div>
  );
}
