#!/usr/bin/env node
// native-host.js — MCP Multi Bridge Native Messaging Host
// Bridges Chrome Native Messaging ↔ stdio-based MCP server child processes.

'use strict';

const { spawn } = require('child_process');
const path = require('path');

let childProcess = null;
let stdoutBuffer = '';

// ===================== Chrome Native Messaging I/O =====================
// Chrome sends/receives messages as: [4-byte LE length][JSON payload]

function sendToChrome(msg) {
  const json = JSON.stringify(msg);
  const len = Buffer.byteLength(json, 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32LE(len, 0);
  process.stdout.write(header);
  process.stdout.write(json, 'utf8');
}

let inputBuffer = Buffer.alloc(0);

process.stdin.on('data', (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  processInput();
});

function processInput() {
  while (true) {
    if (inputBuffer.length < 4) return;
    const msgLen = inputBuffer.readUInt32LE(0);
    if (inputBuffer.length < 4 + msgLen) return;

    const jsonStr = inputBuffer.slice(4, 4 + msgLen).toString('utf8');
    inputBuffer = inputBuffer.slice(4 + msgLen);

    try {
      const msg = JSON.parse(jsonStr);
      handleMessage(msg);
    } catch (e) {
      sendToChrome({ type: 'error', error: 'Invalid JSON: ' + e.message });
    }
  }
}

// ===================== Message Handler =====================

function handleMessage(msg) {
  switch (msg.action) {
    case 'spawn':
      spawnChild(msg.command, msg.args || []);
      break;

    case 'send':
      if (childProcess && !childProcess.killed) {
        try {
          childProcess.stdin.write(msg.data + '\n');
        } catch (e) {
          sendToChrome({ type: 'error', error: 'Write to child failed: ' + e.message });
        }
      } else {
        sendToChrome({ type: 'error', error: 'No child process running' });
      }
      break;

    case 'kill':
      killChild();
      break;

    default:
      sendToChrome({ type: 'error', error: 'Unknown action: ' + msg.action });
  }
}

// ===================== Child Process Management =====================

function spawnChild(command, args) {
  // Kill existing child if any
  killChild();

  try {
    childProcess = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      windowsHide: true,
    });

    childProcess.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop(); // keep incomplete trailing line
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          sendToChrome({ type: 'stdout', data: trimmed });
        }
      }
    });

    childProcess.stderr.on('data', (data) => {
      sendToChrome({ type: 'stderr', data: data.toString() });
    });

    childProcess.on('error', (err) => {
      sendToChrome({ type: 'error', error: 'Spawn error: ' + err.message });
      childProcess = null;
    });

    childProcess.on('close', (code) => {
      sendToChrome({ type: 'closed', code });
      childProcess = null;
    });

    sendToChrome({ type: 'spawned' });
  } catch (e) {
    sendToChrome({ type: 'error', error: 'Failed to spawn: ' + e.message });
  }
}

function killChild() {
  if (childProcess && !childProcess.killed) {
    try {
      childProcess.kill();
    } catch (_) {}
    childProcess = null;
    stdoutBuffer = '';
  }
}

// ===================== Cleanup =====================
process.on('exit', killChild);
process.on('SIGTERM', () => { killChild(); process.exit(0); });
process.on('SIGINT', () => { killChild(); process.exit(0); });

// Keep process alive
process.stdin.resume();
