const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            webSecurity: false,  // Add this for development
        },
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        // Development
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // Production - Use file:// protocol properly
        const indexPath = path.join(__dirname, '../dist/index.html');

        // Convert to file:// URL
        const fileUrl = `file://${indexPath.replace(/\\/g, '/')}`;
        console.log('Loading URL:', fileUrl);

        mainWindow.loadURL(fileUrl).catch(err => {
            console.error('Failed to load:', err);

            // Alternative: Try loadFile with error handling
            mainWindow.loadFile(indexPath).catch(loadErr => {
                console.error('Also failed with loadFile:', loadErr);
                mainWindow.loadURL(`data:text/html,<h1>Error Loading App</h1><p>${loadErr.message}</p>`);
            });
        });
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});