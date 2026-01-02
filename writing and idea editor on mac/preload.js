const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Add APIs here to expose to the renderer process
});