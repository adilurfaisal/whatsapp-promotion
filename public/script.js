let { ipcRenderer } = require("electron")
console.log(ipcRenderer)
let searchForm = document.querySelector("form#search-form")
let searchInput = document.querySelector("#search-form input[name='search_for']")
let searchResponses = document.querySelector("#search-form #responses")


searchForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    let line = searchInput.value
    searchInput.value = ""
    let responseText = await ipcRenderer.invoke("console", line)
    console.log(responseText)
    let response = document.createElement("div")
    response.textContent = responseText
    searchResponses.appendChild(response)
})