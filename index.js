const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const puppeteer = require('puppeteer');
const { Client } = require('whatsapp-web.js');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'public/preload.js')
        }
    })
    win.webContents.openDevTools()
    win.loadFile('public/index.html')
}


app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

})

ipcMain.handle("console", async (event, line) => {

    const browser = await puppeteer.launch({
        executablePath: "./chrome-win/chrome.exe",
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${line}&tbm=lcl`);

    const items = await page.$$(`div[jscontroller="AtSb"]`)

    let items_list = await items.map(async (item) => {
        let itemEl = await item;
        const title = await itemEl.$(`span.OSrXXb`);
        const dataJson = {
            title: await (await title.getProperty('innerHTML')).jsonValue()
        }
        return dataJson;
    }, 0);



    console.log(`Received from frontend: ${line}`)
    return JSON.stringify(items_list)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})