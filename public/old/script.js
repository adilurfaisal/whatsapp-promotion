let { ipcRenderer } = require("electron") 

let searchForm = document.querySelector("form#search-form")
let searchInput = document.querySelector("#search-form input[name='search_for']")

let ContactTable = document.querySelector("#responses table")


searchForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    let line = searchInput.value
    const result = await ipcRenderer.invoke('start-contact-sync', line)
})

console.log(ipcRenderer)

ipcRenderer.on("ping", async (evt, msg)=>{
    console.log(msg)
})

ipcRenderer.on("contact-sync-data-tbl", async (evt, data)=>{
    console.log(data)
    data.forEach((v)=>{
        if(v.title && v.phone){
        let tblrow = `<tr><td>${v.title}</td><td>${v.phone}</td></tr>`;
        var dataFormatEle = new DOMParser().parseFromString(tblrow, "text/xml");
        ContactTable.append(dataFormatEle.firstChild);
        }

    })
    //ContactTable.append(dataFormatEle.firstChild);
})



let versions ={
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
}
const information = document.getElementById('info');
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;