
const { loadModule } = window['vue3-sfc-loader'];

const options = {
  moduleCache: {
    vue: Vue,
  },
  getFile(url) {
    return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
  },
  addStyle(styleStr) {
    const style = document.createElement('style');
    style.textContent = styleStr;
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
  log(type, ...args) {

    console.log(type, ...args);
  },
  compiledCache: {
    set(key, str) {

      // naive storage space management
      for (;;) {

        try {

          // doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage
          window.localStorage.setItem(key, str);
          window.localStorage.removeItem(key);
          break;
        } catch(ex) {

          // handle: Uncaught DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota

          window.localStorage.removeItem(window.localStorage.key(0));
        }
      }
    },
    get(key) {

      return window.localStorage.getItem(key);
    },
  },
  additionalModuleHandlers: {
    '.json': (source, path, options) => JSON.parse(source),
  }
}