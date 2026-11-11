import { useWebMCP } from 'use-webmcp-tool';
import { tools } from '../data/tools';

const toolRoutes = Object.fromEntries(tools.map((tool) => [tool.id, `/tools/${tool.slug}.html`]));

export default function WebMCPTools() {
  const listing = useWebMCP({
    name: 'xconvert_list_image_tools',
    description: 'List the image editing and conversion tools available on XConvert Pro.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => tools.map((tool) => ({
      id: tool.id,
      name: tool.shortTitle,
      url: `https://xconvert.pro/tools/${tool.slug}.html`,
      description: tool.description,
    })),
  });

  const opening = useWebMCP({
    name: 'xconvert_open_image_tool',
    description: 'Open one of the XConvert Pro image tool pages. The user must choose a local image in the workspace before it can be processed.',
    inputSchema: {
      type: 'object',
      properties: { tool: { type: 'string', enum: tools.map((tool) => tool.id) } },
      required: ['tool'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, consequentialHint: false },
    execute: ({ tool }) => {
      const path = toolRoutes[tool];
      if (!path) throw new Error('Unsupported image tool.');
      window.location.assign(path);
      return `Opening ${tool}. Choose an image in the page to continue.`;
    },
  });

  if (!listing.supported || !listing.registered || !opening.registered) return null;
  return <span className="sr-only" aria-live="polite">XConvert Pro image tools are available to supported browser agents.</span>;
}
