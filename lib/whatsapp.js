
'use strict';
const { Client, Location, List, Buttons, LocalAuth, MessageMedia } = require('whatsapp-web.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();

class whatsApp {

    constructor(name) {
        this.qrCode = "";
        this.ready = false;
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: String(name)
            }),
            puppeteer: {
                executablePath: "./chrome-win/chrome.exe",
                headless: false
            }
        });


        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            this.ready = false;
            eventEmitter.emit('ready', this.ready);
            eventEmitter.emit('qr-code', this.qrCode);
        });

        this.client.on('loading_screen', (percent, message) => {
            console.log('LOADING SCREEN', percent, message);
        });

        this.client.on('authenticated', () => {

        });

        this.client.on('ready', async () => {
            this.ready = true;
            this.qrCode = "";
            eventEmitter.emit('ready', this.ready);
        });

        this.client.on('message', async msg => {
            //console.log(msg)
            if(msg.hasMedia){
                const attachmentData = await msg.downloadMedia();
                console.log(attachmentData)
                msg.reply(`
                    *Media info*
                    MimeType: ${attachmentData.mimetype}
                    Filename: ${attachmentData.filename}
                    Data (length): ${attachmentData.data.length}
                `);
            }else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.hasMedia) {
                    const attachmentData = await quotedMsg.downloadMedia();
                    console.log('attachmentData', attachmentData)
                }
            }
        });

        this.client.on('disconnected', (reason) => {
            this.ready = false;
            eventEmitter.emit('ready', this.ready);
        });
    }

    on(evt, fn) {
        eventEmitter.on(evt.trim(), fn);
    }

    async start() {
        return await this.client.initialize();
    }

    async sendTo(to, msg) {
        if (this.ready == true) {
            to = to.startsWith('880') ? to : `88${to}`;
            to = to.includes('@c.us') ? to : `${to}@c.us`;
            return await this.client.sendMessage(to, msg);
        } else {
            this.ready = false;
            eventEmitter.emit('ready', this.ready);
            return "not ready!";
        }
    }

    async checkNumber(to) {
        if (this.ready == true) {
            to = to.startsWith('880') ? to : `88${to}`;
            let checkNum = await this.client.getNumberId(to);
            return checkNum;
        } else {
            this.ready = false;
            eventEmitter.emit('ready', this.ready);
            return false;
        }
    }

}

module.exports = { whatsApp, MessageMedia };