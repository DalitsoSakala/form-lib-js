

namespace FORM_LIB {
    type field_t = DateConstructor | StringConstructor | NumberConstructor | BooleanConstructor

    declare interface CompoundSchemaMetadata {
        type: field_t
        required?: boolean
        pattern?: string | RegExp
        default?: any
        min?: number
        max?: number
    }
    /**
     * When `fields` and `exclude` are not provided, all fields are rendered
     */
    interface FormConfigMetadata {
        schema: Schema
        fields?: string[]
        exclude?: string[]
    }

    declare interface Schema {
        [k: string]: field_t | CompoundSchemaMetadata
    }


    export namespace fn_utils {
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

    export namespace html_element {
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





    function createFormTemplate({ schema, fields, exclude }: FormConfigMetadata) {
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



    export class Form {
        protected _schema!: Schema
        protected _fields?: string[]
        protected _exclude?: string[]
        constructor(data?: any, args?: { instance: any }) { }

        protected _render() {
            let config = this.configure()
            return createFormTemplate(config)
        }
        toString() {
            return this._render()
        }
        /**
         * Configure your form from here
         * @returns Metadata to configure the form
         */
        protected configure(): FormConfigMetadata {
            return {} as FormConfigMetadata
        }
    }


}


(function (global) {

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


    if (isBrowser())
        Object.assign(global, { FORM_LIB })
    else Object.assign(global, FORM_LIB)
}(this));