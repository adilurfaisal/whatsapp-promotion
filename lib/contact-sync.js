
'use strict';
const puppeteer = require('puppeteer');
var events = require('events');
var eventEmitter = new events.EventEmitter();

module.exports = class ContactSync {
    
    constructor(keyword) {
        this.keyword = keyword;
        this.browser = null;
    }

    on (evt, fn){
        eventEmitter.on(evt.trim(), fn);
    }

    async stop() {
        eventEmitter.emit('fetchDone', {success: true});
        await this.browser.close();
    }

    async start() {
        this.browser = await puppeteer.launch({
            executablePath: "./chrome-win/chrome.exe",
            headless: false
        });
        await this.pageSync(`https://www.google.com/search?q=${this.keyword}&tbm=lcl&hl=en`);
    }

    async pageSync (url) {
        const page = await this.browser.newPage();
        await page.goto(url);
        const fullEle = await page.$(`div.rl_full-list`)
        const items = await fullEle.$$(`div[jscontroller="AtSb"]`)
        let items_list = await items.map(async (item) => {
            const details = await item.$(`div.rllt__details`);
            const title = await details.$(`span.OSrXXb`);
            const detailsEle = await (await details.getProperty('textContent')).jsonValue()
            const titleEle = await (await title.getProperty('textContent')).jsonValue()
            let phoneNumber = detailsEle.match(/(01)([0-9]{3})-([0-9]{6})/g);
    
            const dataJson = {
                title: titleEle,
                details: detailsEle,
                phoneNumber: phoneNumber,
                phone: phoneNumber ? phoneNumber.toString().replace(/[^0-9]/g, "") : "",
            }
            return dataJson;
        }, 0);
    
        let contactData = [];
        await items_list.forEach(async (d)=>{
            let itemData = await d;
            if(itemData.phone>0){
                contactData.push(await d);
            }
        })
    
        
        await setTimeout(async ()=>{
            try {
                const nextBtn = await page.$(`a#pnnext`);
                const nextBtnUrl = await (await nextBtn.getProperty('href')).jsonValue();
                eventEmitter.emit('fetchAll', contactData);
                setTimeout(()=>{
                    page.close();
                }, 1000*2)
                return await this.pageSync(nextBtnUrl)
            } catch (error) {
                await this.stop();
                console.log(error)
            }
        }, 1000)
        
    }
}