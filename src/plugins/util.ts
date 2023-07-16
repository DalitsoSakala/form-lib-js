namespace FORM_LIB {

   export namespace plugins {
        export function insertAtIndex(str: string, substring: string, index: number) {
            return str.slice(0, index) + substring + str.slice(index);
        }

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
    }

}