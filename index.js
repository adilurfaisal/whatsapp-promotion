const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('path');
const ContactSync = require('./lib/contact-sync.js');
const { whatsApp, MessageMedia } = require('./lib/whatsapp.js');

const SimplDB = require('simpl.db');
const db = new SimplDB();

const contacts = db.createCollection('contacts');
const ContactSyncD = new ContactSync()

const whatsapp = new whatsApp()

const sendMsg = db.createCollection('sendmsg');

let win = null;


function createWindow() {
    win = new BrowserWindow({
        width: 1100,
        height: 800,
        autoHideMenuBar: true,
        transparent: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'public/preload.js')
        }
    })
    win.setIcon(path.join(__dirname, 'public/assets/bu_logo(16x16).png'));

    win.webContents.on('did-finish-load', () => {
        win.webContents.openDevTools({ mode: 'detach' })

        let contactData = JSON.parse(JSON.stringify(contacts.fetchAll()));
        win.webContents.send('contact-sync-data-tbl', contactData);
        win.webContents.send('contact-sync-done', []);
        win.webContents.send('ready', whatsapp.ready);
        whatsapp.start()

        const NOTIFICATION_TITLE = 'Basic Notification'
        const NOTIFICATION_BODY = 'Notification from the Main process'

        //new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
    })
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

whatsapp.on("qr-code", (data) => {
    win.webContents.send('qr-login', data);
})

whatsapp.on("ready", async (data) => {
    win.webContents.send('ready', data);
})

let msgFormat = (text, arr) => {
    return text.replace(/\{{(.+?)\}}/g, function(string, key){
        return arr[key];
    })
}

let sendMsgSch = async (attachment, list, num, timeOut) => {
    let listData = list[num];
    let to = '01975626704'; //list[num]['phone'];
    to = to.replace(/[^0-9]/g, "");
    to = to.startsWith('880') ? to : `88${to}`;
    to = to.includes('@c.us') ? to : `${to}@c.us`;
    let msgTxt = listData['msg'];
    let timeOutRandom = Math.floor(Math.random() * (timeOut.max - timeOut.min + 1)) + timeOut.min;
    console.log(1000*timeOutRandom)
    if(whatsapp.checkNumber(to)){
        if(attachment){
            let attachmentData = new MessageMedia(attachment.mimetype, attachment.data, attachment.filename, attachment.filesize);
            sendstatus = await whatsapp.client.sendMessage(to, msgTxt, { media: attachmentData });
        }else{
            sendstatus = await whatsapp.client.sendMessage(to, msgTxt);
        }
        let status = sendstatus ? "success" : "failed";
        win.webContents.send('send-sync-data-tbl', [{ title: listData['title'], phone: listData['phone'], body: msgTxt, status: status }]);
        const sendMsgFind = sendMsg.get(target => target.phone === listData.phone);
        if(sendMsgFind){
            sendMsgFind.status = "elemen.tittle";
            sendMsgFind.save();
        }else{
            sendMsg.create({ title: listData['title'], phone: listData['phone'], body: msgTxt, status: status });
        }
        setTimeout(() => {
            num++;
            sendMsgSch(attachment, list, num, timeOut);
        }, 1000*timeOutRandom);
    }else{
        num++;
        sendMsgSch(attachment, list, num);
    }
}


ipcMain.handle('send-msg', async (event, ...args) => {
    let type = args[0];
    let sendstatus = "";
    let file_data = args[2];
    let txt_msg = args[3];
    let timeOut = { min: args[4], max: args[5] };
    if(type=="Contact"){
        const contactAll = contacts.fetchAll();
        contactAll.map((v)=>{
            v['msg'] = msgFormat(txt_msg, v)
            return v;
        })
        sendMsgSch(file_data, contactAll, 0, timeOut);
    }else if(type=="Single"){
        let to = args[1] 
        to = to.startsWith('880') ? to : `88${to}`;
        to = to.includes('@c.us') ? to : `${to}@c.us`;
        if(whatsapp.checkNumber(to)){
            if(file_data){
                let attachmentData = new MessageMedia(file_data.mimetype, file_data.data, file_data.filename, file_data.filesize)
                sendstatus = await whatsapp.client.sendMessage(to, txt_msg, { media: attachmentData });
            }else{
                sendstatus = await whatsapp.client.sendMessage(to, txt_msg);
            }
        }
    }
    return sendstatus;
});

ipcMain.handle('qr-login', async (event, ...args) => {
    win.webContents.send('qr-login', whatsapp.qrCode);
});

ipcMain.handle('closeApp', async (event, ...args) => {
    app.quit();
});

ipcMain.handle('minimizeWin', async (event, ...args) => {
    win.minimize();
});

ipcMain.handle('start-contact-sync', async (event, ...args) => {
    contacts.remove();
    ContactSyncD.keyword = args[0]
    ContactSyncD.start();
    ContactSyncD.on("fetchAll", (data) => {
        data.forEach(element => {
            const contactFind = contacts.get(target => target.phone === element.phone);
            if(contactFind){
                contactFind.title = element.title;
                contactFind.save();
            }else{
                contacts.create(element);
            }
        });

        win.webContents.send('contact-sync-data-tbl', data)
    })
    ContactSyncD.on("fetchDone", (data) => {
        win.webContents.send('contact-sync-done', data)
    })
    return args
})

ipcMain.handle('stop-contact-sync', async (event, ...args) => {
    ContactSyncD.stop();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
