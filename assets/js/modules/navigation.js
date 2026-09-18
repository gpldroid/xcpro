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

function toggleDarkMode() {
            const html = document.documentElement;
            const icon = document.getElementById('themeToggleIcon');
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                if (icon) icon.className = 'fa-solid fa-moon text-base text-slate-700';
            } else {
                html.classList.add('dark');
                if (icon) icon.className = 'fa-solid fa-sun text-base text-amber-400';
            }
        }

function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            const button = document.getElementById('mobileMenuButton');
            if (!menu) return;
            const isHidden = menu.classList.toggle('hidden');
            if (button) {
                button.setAttribute('aria-expanded', String(!isHidden));
                button.setAttribute('aria-label', isHidden ? 'Open menu' : 'Close menu');
                const icon = button.querySelector('i');
                if (icon) icon.className = isHidden ? 'fa-solid fa-bars text-xl' : 'fa-solid fa-xmark text-xl';
            }
        }

export { navigateTo, toggleDarkMode, toggleMobileMenu };
