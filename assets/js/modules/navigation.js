// XConvert Pro — navigation and theme controls
import { state, toolsMeta } from './state.js';
const toolRoutes = {
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

function navigateTo(target) {
            if (toolRoutes[target]) {
                window.location.href = toolRoutes[target];
                return;
            }
            state.currentPage = target;
            
            // Hide all page views
            document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (target === 'home') {
                document.getElementById('view-home').classList.remove('hidden');
            } else if (target === 'pricing') {
                document.getElementById('view-pricing').classList.remove('hidden');
                document.getElementById('nav-pricing')?.classList.add('active');
            } else if (target === 'api') {
                document.getElementById('view-api').classList.remove('hidden');
                document.getElementById('nav-api')?.classList.add('active');
            } else if (toolsMeta[target]) {
                // Dedicated Tool View Page
                state.activeTool = target;
                const meta = toolsMeta[target];
                document.getElementById('toolPageTitle').innerText = meta.title;
                document.getElementById('toolPageDesc').innerText = meta.desc;
                document.getElementById('toolPageIcon').className = `fa-solid ${meta.icon}`;
                
                document.getElementById('view-tool').classList.remove('hidden');
                document.getElementById(`nav-${target}`)?.classList.add('active');
            }
        }

function syncThemeIcon() {
    const icon = document.getElementById('themeToggleIcon');
    if (!icon) return;
    icon.className = document.documentElement.classList.contains('dark')
        ? 'fa-solid fa-sun text-base text-amber-400'
        : 'fa-solid fa-moon text-base text-slate-700';
}
function toggleDarkMode() {
    const html = document.documentElement;
    const dark = !html.classList.contains('dark');
    html.classList.toggle('dark', dark);
    try { localStorage.setItem('xconvert-theme', dark ? 'dark' : 'light'); } catch {}
    syncThemeIcon();
}
function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('xconvert-theme'); } catch {}
    const dark = saved === 'dark' || (saved === null && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    syncThemeIcon();
}
initTheme();

function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            const button = document.getElementById('mobileMenuButton');
            if (!menu) return;
            const isOpen = menu.classList.toggle('open');
            if (button) {
                button.setAttribute('aria-expanded', String(isOpen));
                button.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
                const icon = button.querySelector('i');
                if (icon) icon.className = isOpen ? 'fa-solid fa-xmark text-xl' : 'fa-solid fa-bars text-xl';
            }
        }

export { navigateTo, toggleDarkMode, toggleMobileMenu };
