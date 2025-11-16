// public/script.js
const orgInput = document.getElementById('org');
const mainUI = document.getElementById('mainUI');
const workspace = document.getElementById('workspace');
const statusEl = document.getElementById('status');

let token = null;

function status(text, type = 'info') {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = `status text-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
}

async function api(action, data = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch('/api/validate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...data })
  }).then(r => r.json());
}

window.addEventListener('load', async () => {
  try {
    await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'app_opened' })
    });
  } catch (err) {
    console.error('App init failed', err);
  }
});

orgInput?.addEventListener('keypress', async e => {
  if (e.key !== 'Enter') return;
  const org = orgInput.value.trim();
  if (!org) return status('ORG required', 'error');

  status('Authenticating...');
  const res = await api('auth', { org });
  if (!res.success) {
    status(res.error || 'Auth failed', 'error');
    mainUI?.style && (mainUI.style.display = 'none');
    workspace?.classList.remove('unlocked');
    return;
  }

  token = res.token;
  status(`Authenticated as ${org}`, 'success');
  if (mainUI?.style) mainUI.style.display = 'block';
  workspace?.classList.add('unlocked');
});