// XConvert Pro — navigation and theme controls
import { state, toolsMeta } from './state.js';
function navigateTo(target) {
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
                icon.className = 'fa-solid fa-moon text-base text-slate-700';
            } else {
                html.classList.add('dark');
                icon.className = 'fa-solid fa-sun text-base text-amber-400';
            }
        }

function toggleMobileMenu() {
            document.getElementById('mobileMenu').classList.toggle('hidden');
        }

export { navigateTo, toggleDarkMode, toggleMobileMenu };
