
type field_t = DateConstructor | StringConstructor | NumberConstructor | BooleanConstructor

declare interface CompoundSchemaMetadata {
    type: field_t
    required?: boolean
    pattern?: string | RegExp
    default?: any
    min?: number
    max?: number
}

declare interface Schema {
    [k: string]: field_t | CompoundSchemaMetadata
}

namespace fn_utils {
    export function insertAtIndex(str: string, substring: string, index: number) {
        return str.slice(0, index) + substring + str.slice(index);
    }

    export function readableString(str: string) {
        let normalStr = ''
        for (let s of str) {
            if (/[A-Z]/.test(s))
                normalStr += ' ' + s.toLowerCase()
            else normalStr += s
        }
        return normalStr.replace(/\_/g, ' ')
    }
}

namespace html_element {
    export type input_name_t = 'text' | 'checkbox' | 'number' | 'date';

    export interface ElementProperties {
        name?: string
        type?: string
        id?: string
        for?: string
        validators?: string | RegExp
    }

    function setProps(elementString: string, propertiesMap: ElementProperties) {
        let idx = elementString.indexOf('>');
        let propertiesString = ' ';
        for (let key in propertiesMap) {
            propertiesString += ' ' + key + '=\'' + (propertiesMap as any)[key] + '\' '
        }
        return fn_utils.insertAtIndex(elementString, propertiesString, elementString.indexOf('>'))
    }

    export function createInputElement(name: string, type: input_name_t, extraProps: ElementProperties = {}) {
        let template = '<input>'
        template = setProps(template, { name, type, ...extraProps })
        return template
    }

    export function createLabelElement(name: string, extraProps: ElementProperties = {}) {
        let template = '<label>' + fn_utils.readableString(name) + '</label>'
        template = setProps(template, { name, ...extraProps })
        return template
    }

    export function createDivElement(properties: ElementProperties = {}, ...children: string[]) {
        let template = '<div>' + children.join('') + '</div>'
        return setProps(template, properties)
    }

}


function createFormTemplate(schema: Schema) {
    let template = '';

    let { createDivElement, createInputElement, createLabelElement } = html_element
    for (let key in schema) {
        let target = schema[key]
        template += match(key, target)
    }

    return template;

    function match(key: string, fieldTypeMetadata: field_t | CompoundSchemaMetadata, extraProps: html_element.ElementProperties = {}): string {
        switch (fieldTypeMetadata) {
            case String:
                return createDivElement({}, createLabelElement(key), createInputElement(key, 'text', extraProps))
                break;
            case Date:
                return createDivElement({}, createLabelElement(key), createInputElement(key, 'date', extraProps))
                break;
            case Number:
                return createDivElement({}, createLabelElement(key), createInputElement(key, 'number', extraProps))
                break;
            case Boolean:
                return createDivElement({}, createLabelElement(key), createInputElement(key, 'checkbox', extraProps))
                break;
            default:
                // Compund schema metadata
                if (!('type' in fieldTypeMetadata)) throw TypeError('An invalid type descriptor was passed to describe a field "' + key + '"')
                let attrs: any = { ...fieldTypeMetadata }
                delete attrs.type
                delete attrs.set
                delete attrs.validators

                return match(key, fieldTypeMetadata.type, attrs)

        }
    }
}


