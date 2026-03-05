// popup.js — MCP Multi Bridge Popup Logic
// Manages adding, removing, connecting/disconnecting multiple MCP servers.

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const addForm     = document.getElementById('addForm');
  const nameInput   = document.getElementById('serverName');
  const urlInput    = document.getElementById('serverUrl');
  const transportSel = document.getElementById('serverTransport');
  const serverList  = document.getElementById('serverList');
  const refreshBtn  = document.getElementById('refreshBtn');

  // ---- Messaging ----
  function send(msg) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(msg, (resp) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!resp) return reject(new Error('No response'));
        if (!resp.ok) return reject(new Error(resp.error || 'Unknown error'));
        resolve(resp.data);
      });
    });
  }

  // ---- Add server ----
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    const transport = transportSel.value;

    if (!name || !url) return;

    const btn = addForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Adding...';

    try {
      await send({ type: 'addServer', name, url, transport });
      nameInput.value = '';
      urlInput.value = '';
      loadServers();
    } catch (err) {
      alert('Failed to add server: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Add Server';
    }
  });

  // ---- Refresh ----
  refreshBtn.addEventListener('click', () => loadServers());

  // ---- Load & render servers ----
  async function loadServers() {
    try {
      const servers = await send({ type: 'getServers' });
      renderServers(servers);
    } catch (err) {
      serverList.innerHTML = `<p class="empty">Error: ${esc(err.message)}</p>`;
    }
  }

  function renderServers(servers) {
    if (!servers || servers.length === 0) {
      serverList.innerHTML = '<p class="empty">No servers configured yet.</p>';
      return;
    }

    serverList.innerHTML = servers.map((s) => `
      <div class="server-card" data-id="${s.id}">
        <div class="server-card-header">
          <span class="status-dot ${s.status || 'disconnected'}"></span>
          <span class="server-name">${esc(s.name)}</span>
        </div>
        <div class="server-card-meta">
          <span>${esc(s.url)}</span>
          <span>[${esc(s.transport || 'sse')}]</span>
          <span>${s.toolCount || 0} tools</span>
        </div>
        <div class="server-card-actions">
          <label class="toggle-label">
            <input type="checkbox" class="toggle-enabled" ${s.enabled ? 'checked' : ''} />
            <span>Enabled</span>
          </label>
          ${s.status === 'connected'
            ? `<button class="btn btn-sm btn-danger disconnect-btn">Disconnect</button>`
            : `<button class="btn btn-sm btn-success connect-btn">Connect</button>`
          }
          <button class="btn btn-sm btn-danger remove-btn">Remove</button>
        </div>
      </div>
    `).join('');

    // Bind actions
    serverList.querySelectorAll('.server-card').forEach((card) => {
      const id = card.dataset.id;

      card.querySelector('.toggle-enabled')?.addEventListener('change', async (e) => {
        try {
          await send({ type: 'toggleServer', serverId: id, enabled: e.target.checked });
          setTimeout(loadServers, 500);
        } catch (err) {
          alert('Toggle failed: ' + err.message);
          e.target.checked = !e.target.checked;
        }
      });

      card.querySelector('.connect-btn')?.addEventListener('click', async () => {
        try {
          await send({ type: 'connectServer', serverId: id });
        } catch (err) {
          alert('Connect failed: ' + err.message);
        }
        setTimeout(loadServers, 500);
      });

      card.querySelector('.disconnect-btn')?.addEventListener('click', async () => {
        try {
          await send({ type: 'disconnectServer', serverId: id });
        } catch (err) {
          alert('Disconnect failed: ' + err.message);
        }
        setTimeout(loadServers, 500);
      });

      card.querySelector('.remove-btn')?.addEventListener('click', async () => {
        if (!confirm(`Remove server "${card.querySelector('.server-name').textContent}"?`)) return;
        try {
          await send({ type: 'removeServer', serverId: id });
          loadServers();
        } catch (err) {
          alert('Remove failed: ' + err.message);
        }
      });
    });
  }

  // ---- Utility ----
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  // ---- Listen for background events ----
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'serverStatus') {
      loadServers();
    }
  });

  // ---- Initial load ----
  loadServers();
});
