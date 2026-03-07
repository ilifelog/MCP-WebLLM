// popup.js — MCP Multi Bridge Popup Logic
// Manages adding, removing, connecting/disconnecting multiple MCP servers.

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const addForm = document.getElementById('addForm');
  const nameInput = document.getElementById('serverName');
  const urlInput = document.getElementById('serverUrl');
  const transportSel = document.getElementById('serverTransport');
  const commandInput = document.getElementById('serverCommand');
  const argsInput = document.getElementById('serverArgs');
  const urlRow = document.getElementById('urlRow');
  const commandRow = document.getElementById('commandRow');
  const argsRow = document.getElementById('argsRow');
  const serverList = document.getElementById('serverList');
  const refreshBtn = document.getElementById('refreshBtn');

  // ---- Transport toggle: show/hide fields ----
  function updateFormFields() {
    const isStdio = transportSel.value === 'stdio';
    urlRow.style.display = isStdio ? 'none' : '';
    commandRow.style.display = isStdio ? '' : 'none';
    argsRow.style.display = isStdio ? '' : 'none';
    urlInput.required = !isStdio;
  }
  transportSel.addEventListener('change', updateFormFields);
  updateFormFields();

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
    const transport = transportSel.value;

    if (!name) return;

    const btn = addForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Adding...';

    try {
      const payload = { type: 'addServer', name, transport };
      if (transport === 'stdio') {
        payload.command = commandInput.value.trim() || 'npx';
        payload.args = argsInput.value.trim();
      } else {
        payload.url = urlInput.value.trim();
        if (!payload.url) { alert('URL is required'); return; }
      }
      await send(payload);
      nameInput.value = '';
      urlInput.value = '';
      commandInput.value = '';
      argsInput.value = '';
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

    serverList.innerHTML = servers.map((s) => {
      const isStdio = s.transport === 'stdio';
      const editableField = isStdio
        ? `<div class="editable-field">
             <label class="edit-label">Command</label>
             <input type="text" class="edit-command" value="${esc(s.command || 'npx')}" />
           </div>
           <div class="editable-field">
             <label class="edit-label">Args</label>
             <input type="text" class="edit-args" value="${esc(s.args || '')}" placeholder="Arguments..." />
           </div>`
        : `<div class="editable-field">
             <label class="edit-label">URL</label>
             <input type="text" class="edit-url" value="${esc(s.url || '')}" placeholder="URL..." />
           </div>`;

      return `
      <div class="server-card" data-id="${s.id}" data-transport="${s.transport || 'sse'}">
        <div class="server-card-header">
          <span class="status-dot ${s.status || 'disconnected'}"></span>
          <span class="server-name">${esc(s.name)}</span>
        </div>
        <div class="server-card-meta">
          <span>[${esc(s.transport || 'sse')}]</span>
          <span>${s.toolCount || 0} tools</span>
        </div>
        ${editableField}
        <div class="server-card-actions">
          <label class="toggle-label">
            <input type="checkbox" class="toggle-enabled" ${s.enabled ? 'checked' : ''} />
            <span>Enabled</span>
          </label>
          <button class="btn btn-sm btn-save save-btn" style="display:none">Save</button>
          ${s.status === 'connected'
          ? `<button class="btn btn-sm btn-danger disconnect-btn">Disconnect</button>`
          : `<button class="btn btn-sm btn-success connect-btn">Connect</button>`
        }
          <button class="btn btn-sm btn-danger remove-btn">Remove</button>
        </div>
      </div>
    `}).join('');

    // Bind actions
    serverList.querySelectorAll('.server-card').forEach((card) => {
      const id = card.dataset.id;
      const transport = card.dataset.transport;
      const saveBtn = card.querySelector('.save-btn');

      // ---- Editable fields: show Save button on change ----
      const editInputs = card.querySelectorAll('.edit-url, .edit-command, .edit-args');
      editInputs.forEach((input) => {
        const originalValue = input.value;
        input.addEventListener('input', () => {
          // Show save button if any value changed
          const changed = Array.from(editInputs).some(
            (inp) => inp.value !== inp.getAttribute('value')
          );
          saveBtn.style.display = changed ? '' : 'none';
        });
      });

      // ---- Save button ----
      saveBtn?.addEventListener('click', async () => {
        const update = { id };
        if (transport === 'stdio') {
          const cmdInput = card.querySelector('.edit-command');
          const argInput = card.querySelector('.edit-args');
          update.command = cmdInput ? cmdInput.value.trim() : '';
          update.args = argInput ? argInput.value.trim() : '';
        } else {
          const urlInp = card.querySelector('.edit-url');
          update.url = urlInp ? urlInp.value.trim() : '';
        }
        try {
          await send({ type: 'updateServer', server: update });
          setTimeout(loadServers, 500);
        } catch (err) {
          alert('Save failed: ' + err.message);
        }
      });

      // ---- Toggle enabled ----
      card.querySelector('.toggle-enabled')?.addEventListener('change', async (e) => {
        try {
          await send({ type: 'toggleServer', serverId: id, enabled: e.target.checked });
          setTimeout(loadServers, 500);
        } catch (err) {
          alert('Toggle failed: ' + err.message);
          e.target.checked = !e.target.checked;
        }
      });

      // ---- Connect / Disconnect ----
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

      // ---- Remove ----
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
