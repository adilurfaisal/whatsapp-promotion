const puppeteer = require('puppeteer');
const SimplDB = require('simpl.db');
const db = new SimplDB();

const Users = db.createCollection('users');
Users.remove();

let init = async () => {
    
    const browser = await puppeteer.launch({
        executablePath: "./chrome-win/chrome.exe",
        headless: false
    });
    await pageSync(browser, `https://www.google.com/search?q=garments industries in narayanganj&tbm=lcl`);
}

let pageSync = async (browser, url) => {
    const page = await browser.newPage();
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

    await items_list.forEach(async (d)=>{
        const companyDetails = await d;
        if(companyDetails && companyDetails.phoneNumber && companyDetails.phoneNumber.toString().length==12){
            const user = Users.get(target => target.phoneNumber === companyDetails.phoneNumber);
            if(user){
                user.title = companyDetails.title;
            }else{
                Users.create(companyDetails);
            }
        }
    })

    
    await setTimeout(async ()=>{
        try {
            const nextBtn = await page.$(`a#pnnext`);
            const nextBtnUrl = await (await nextBtn.getProperty('href')).jsonValue();
            const userJSON = Users.fetchAll();
            console.log(userJSON)
            setTimeout(()=>{
                page.close();
            }, 1000*2)
            return await pageSync(browser, nextBtnUrl)
        } catch (error) {
            console.log(error)
        }
    }, 1000)
    
}

init();
