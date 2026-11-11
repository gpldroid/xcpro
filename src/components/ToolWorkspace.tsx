import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { useWebMCP } from 'use-webmcp-tool';
import type { ToolDefinition, ToolField } from '../data/tools';
import { processImageFile, validateImageFile, type ProcessResult } from '../features/image-engine/client';
import { formatBytes, type ImageSettings } from '../features/image-engine/math';

type Props = { tool: ToolDefinition };
function defaults(tool: ToolDefinition): ImageSettings {
  return Object.fromEntries(tool.fields.map((field) => [field.key, field.defaultValue]));
}
function FieldControl({ field, value, onChange }: { field: ToolField; value: string | number | boolean; onChange: (value: string | number | boolean) => void }) {
  if (field.type === 'toggle') return <label className="control control--toggle"><span>{field.label}</span><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /></label>;
  if (field.type === 'select') return <label className="control"><span>{field.label}</span><select value={String(value)} onChange={(event) => onChange(event.target.value)}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  if (field.type === 'text') return <label className="control"><span>{field.label}</span><input type="text" maxLength={120} value={String(value)} onChange={(event) => onChange(event.target.value)} /></label>;
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

  const webmcp = useWebMCP({
    name: 'xconvert_process_current_image',
    description: `Process the image already selected by the user in the ${tool.shortTitle} workspace. Does not download automatically or transmit image data.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, consequentialHint: true },
    enabled: Boolean(file) && !busy,
    execute: async (_input, { signal }) => runProcessing(signal),
  });

  const fields = useMemo(() => tool.fields.map((field) => <FieldControl key={field.key} field={field} value={settings[field.key] ?? field.defaultValue} onChange={(value) => setSettings((current) => ({ ...current, [field.key]: value }))} />), [settings, tool.fields]);
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

  return (
    <div className="workspace">
      <div className="workspace__top"><div><span className="eyebrow">PRIVATE BROWSER WORKSPACE</span><h2>{tool.shortTitle}</h2><p>{tool.summary}</p></div>{file && <button className="button button--quiet" type="button" onClick={() => inputRef.current?.click()}>Replace image</button>}</div>
      <input ref={inputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) acceptFile(selected); event.currentTarget.value = ''; }} />
      {!file ? (
        <div className={`upload-zone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          <div className="upload-zone__icon" aria-hidden="true">↥</div><h3>Drop an image here</h3><p>Or select a file from your device. Files stay in this browser session.</p><button type="button" className="button button--primary" onClick={() => inputRef.current?.click()}>Choose image</button><small>PNG, JPEG, WebP, AVIF, GIF or BMP · Up to 40 MB</small>
        </div>
      ) : (
        <div className="workspace__grid">
          <section className="preview-panel" aria-label="Image preview"><div className="preview-panel__bar"><span>{result ? 'Processed result' : 'Original image'}</span><div className="preview-panel__actions">{result && <button type="button" className="text-button" onClick={() => setCompare((value) => !value)} aria-pressed={compare}>{compare ? 'Show result' : 'Compare original'}</button>}<button type="button" className="text-button" onClick={resetResult}>Reset preview</button></div></div><div className="preview-panel__image"><img src={compare ? sourceUrl : resultUrl || sourceUrl} alt={compare ? 'Original uploaded image' : result ? 'Processed image preview' : 'Original uploaded image'} /></div><div className="file-meta"><span>{file.name}</span><span>{formatBytes(file.size)}</span>{result && <span>Output: {formatBytes(result.blob.size)}</span>}</div></section>
          <aside className="settings-panel" aria-label="Image settings"><div className="settings-panel__heading"><h3>Adjust settings</h3><button type="button" className="text-button" onClick={resetSettings}>Reset</button></div><div className="settings-fields">{fields}</div><button type="button" className="button button--primary button--wide" disabled={busy} onClick={() => void runProcessing().catch(() => {})}>{busy ? 'Processing image…' : 'Apply and preview'}</button>{result && <a className="button button--secondary button--wide" href={resultUrl} download={result.fileName}>Download image</a>}<p className="privacy-note">Your image is processed locally. Nothing is uploaded by this tool.</p></aside>
        </div>
      )}
      <div className="workspace__status" aria-live="polite">{busy && <span className="status status--working">Processing in your browser…</span>}{notice && !busy && <span className="status status--success">{notice}</span>}{error && <span className="status status--error">{error}</span>}{webmcp.supported && webmcp.registered && <span className="status status--agent">Browser agent tool available</span>}</div>
    </div>
  );
}
