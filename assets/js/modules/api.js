// XConvert Pro — API and utility modals
import { showToast } from './workspace.js';
function switchApiTab(tab) {
            document.querySelectorAll('.api-tab').forEach(t => {
                t.className = 'api-tab px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700';
            });
            document.getElementById(`tab-${tab}`).className = 'api-tab px-4 py-2 rounded-xl bg-ilove-navy text-white';

            const snippet = document.getElementById('codeSnippet');
            if (tab === 'curl') {
                snippet.innerText = `curl -X POST https://api.xconvertpro.com/v1/compress \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -F "image=@photo.jpg" \\\n  -F "quality=80"`;
            } else if (tab === 'js') {
                snippet.innerText = `const formData = new FormData();\nformData.append('image', fileInput.files[0]);\n\nconst response = await fetch('https://api.xconvertpro.com/v1/compress', {\n  method: 'POST',\n  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },\n  body: formData\n});\nconst blob = await response.blob();`;
            } else if (tab === 'python') {
                snippet.innerText = `import requests\n\nurl = 'https://api.xconvertpro.com/v1/compress'\nheaders = {'Authorization': 'Bearer YOUR_API_KEY'}\nfiles = {'image': open('photo.jpg', 'rb')}\n\nresponse = requests.post(url, headers=headers, files=files)\nwith open('output.jpg', 'wb') as f:\n    f.write(response.content)`;
            }
        }

function openApiKeyModal() {
            document.getElementById('apiKeyModal').classList.remove('hidden');
        }

function closeApiKeyModal() {
            document.getElementById('apiKeyModal').classList.add('hidden');
        }

function showProCheckoutModal(planName, price) {
            showToast(`Selected ${planName} plan (${price}/mo). Payment gateway ready.`);
        }

function copyText(id) {
            const text = document.getElementById(id).innerText;
            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showToast('Copied to clipboard!');
        }

export { switchApiTab, openApiKeyModal, closeApiKeyModal, showProCheckoutModal, copyText };
