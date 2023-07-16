

export function setProps(elementString: string, propertiesMap: any, plugins: { insertAtIndex: (e: string, prop: string, idx: number) => string }) {
    let propertiesString = ' ';
    for (let key in propertiesMap) {
        propertiesString += ' ' + key + '=\'' + (propertiesMap as any)[key] + '\' '
    }
    return plugins.insertAtIndex(elementString, propertiesString, elementString.indexOf('>'))
}



export function validateValue(type: string, value: any) {
    let str = ''
    if (/^(date)/i.test(type)) {
        str = new Date(value).toISOString()
        if (/^date$/i.test(type))
            return str.substring(0, str.indexOf('T'))
        else if (/^datetime$/i.test(type))
            return str.substring(0, 16)
    }
    return value
}