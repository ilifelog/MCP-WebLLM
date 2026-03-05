(function () {
  // Avoid multiple listener registration
  if (window.__mcpDragListener) return;
  window.__mcpDragListener = true;

  window.addEventListener('message', async event => {
    if (event.source !== window || !event.data || event.data.type !== 'MCP_DROP_FILE') return;

    const { fileName, fileType, lastModified, fileData } = event.data;
    if (!fileData) return;

    const blob = await fetch(fileData).then(res => res.blob());
    const file = new File([blob], fileName, { type: fileType, lastModified });

    // Target the drop zone with multiple fallback selectors (Gemini-specific)
    const dropZone =
      document.querySelector('div[xapfileselectordropzone]') ||
      document.querySelector('.text-input-field') ||
      document.querySelector('.input-area') ||
      document.querySelector('.ql-editor');
    if (!dropZone) {
      console.error('[MCP] dragDropListener: drop zone not found');
      return;
    }

    // Create a DataTransfer-like object (required for Gemini's Angular framework)
    const dataTransfer = {
      files: [file],
      types: ['Files', 'application/x-moz-file'],
      items: [{
        kind: 'file',
        type: file.type,
        getAsFile: function () { return file; },
      }],
      getData: function () { return ''; },
      setData: function () {},
      clearData: function () {},
      dropEffect: 'copy',
      effectAllowed: 'copyMove',
    };

    // Create drag events and attach dataTransfer via defineProperty
    const dragEnterEvent = new Event('dragenter', { bubbles: true, cancelable: true });
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
    const dropEvent = new Event('drop', { bubbles: true, cancelable: true });

    [dragEnterEvent, dragOverEvent, dropEvent].forEach(evt => {
      Object.defineProperty(evt, 'dataTransfer', { value: dataTransfer, writable: false });
    });

    dragOverEvent.preventDefault = function () { Event.prototype.preventDefault.call(this); };
    dropEvent.preventDefault = function () { Event.prototype.preventDefault.call(this); };

    // Simulate full drag sequence
    dropZone.dispatchEvent(dragEnterEvent);
    dropZone.dispatchEvent(dragOverEvent);
    dropZone.dispatchEvent(dropEvent);
    console.log('[MCP] dragDropListener: drag-and-drop simulation completed');
  });
})();
