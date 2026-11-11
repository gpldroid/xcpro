import { useWebMCP } from 'use-webmcp-tool';
import { tools } from '../data/tools';

export default function WebMCPTools() {
  const registration = useWebMCP({
    name: 'xconvert_list_image_tools',
    description: 'List image editing and conversion tools available on XConvert Pro.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => tools.map((tool) => ({ id: tool.id, name: tool.shortTitle, url: `https://xconvert.pro/tools/${tool.slug}.html`, description: tool.description })),
  });

  if (!registration.supported || !registration.registered) return null;
  return <span className="sr-only" aria-live="polite">Image tools are available to supported browser agents.</span>;
}
