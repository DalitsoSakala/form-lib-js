


export function readableString(str: string) {
    let normalStr = ''
    for (let s of str) {
        if (/[A-Z]/.test(s))
            normalStr += ' ' + s
        else normalStr += s
    }
    normalStr = normalStr.replace(/\_+/g, ' ')
    return normalStr[0].toUpperCase() + (normalStr.length > 1 && normalStr.substring(1).toLowerCase() || '')
}


export function registerModule(API: any, closedProperties: string[] = []) {


    function isBrowser() {
        var process: any = process || null
        var require: any = require || null
        // Check if the environment is Node.js
        if (typeof process === "object" &&
            typeof require === "function") {
            return false;
        }

        // Check if the environment is a
        // Service worker
        if (typeof importScripts === "function") {
            return false;
        }

        // Check if the environment is a Browser
        if (typeof window === "object") {
            return true;
        }
    }

    for (let prop of closedProperties) {
        let obj = <any>{}
        obj[prop] = {
            writable: false,
            configurable: false,
        }
        Object.defineProperties(API, {
            obj
        })
    }


    if (isBrowser())
        Object.assign(global, { API })
    else Object.assign(global, API)
}
