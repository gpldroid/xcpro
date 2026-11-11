// Load WebMCP as a progressive enhancement; browsers without the API are unaffected.
import('/assets/js/webmcp.js').catch((error) => {
  console.warn('XConvert Pro WebMCP integration could not load:', error);
});

initSiteShell();
