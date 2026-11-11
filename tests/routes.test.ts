import { describe, expect, it } from 'vitest';
import { tools } from '../src/data/tools';

describe('static tool route inventory', () => {
  it('contains all ten migrated tools', () => { expect(tools).toHaveLength(10); });
  it('has unique identifiers and legacy-compatible HTML paths', () => {
    const ids = tools.map((tool) => tool.id);
    const slugs = tools.map((tool) => tool.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const tool of tools) expect(`/tools/${tool.slug}.html`).toMatch(/^\/tools\/[a-z0-9-]+\.html$/);
  });
  it('documents the non-AI processing limits', () => {
    expect(tools.find((tool) => tool.id === 'removebg')?.summary.toLowerCase()).toContain('not an ai');
    expect(tools.find((tool) => tool.id === 'upscale')?.summary.toLowerCase()).toContain('not ai');
  });
});
