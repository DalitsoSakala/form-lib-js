

namespace FORM_LIB {
    type field_t = DateConstructor | StringConstructor | NumberConstructor | BooleanConstructor
    declare type form_render_t = 'div' | 'p' | 'table'
    declare interface CompoundSchemaMetadata {
        type: field_t
        required?: boolean
        pattern?: string | RegExp
        default?: any
        min?: number
        max?: number
    }
    declare type layout_t = 'bs5' | undefined
    /**
     * When `fields` and `exclude` are not provided, all fields are rendered
     */
    declare interface FormConfigMetadata {
        schema: Schema
        fields?: string[]
        exclude?: string[]
        tag?: string
        renderType?: form_render_t
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
                    normalStr += ' ' + s
                else normalStr += s
            }
            normalStr = normalStr.replace(/\_+/g, ' ')
            return normalStr[0].toUpperCase() + (normalStr.length > 1 && normalStr.substring(1).toLowerCase() || '')
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

        export function createInputElement(name: string, type: input_name_t, extraProps: ElementProperties = {}, configuration: FormConfigMetadata) {
            let template = '<input>'
            template = setProps(template, { name, type, ...extraProps })
            return template
        }

        export function createLabelElement(name: string, extraProps: ElementProperties = {}, configuration: FormConfigMetadata) {
            let template = setProps('<label>', { for: name })
            template += fn_utils.readableString(name) + '</label>'
            return template
        }

        export function createDivElement(properties: ElementProperties = {}, configuration = <FormConfigMetadata>{}, ...children: string[]) {
            let { renderType } = configuration
            let template = setProps(`<${renderType}>`, properties)
            template += children.join('') + `</${renderType}>`
            return setProps(template, properties)
        }

    }

    function createFormTemplate(configuration: FormConfigMetadata) {
        let { createDivElement: Div, createInputElement: Input, createLabelElement: Label } = html_element
        let template = '';
        let excludesLength = 0
        let fieldsLength = 0
        let { schema, fields, exclude, tag = '' } = configuration

        fields = fields || []
        exclude = exclude || []
        fieldsLength = fields.length
        excludesLength = exclude.length

        if (fields.length && exclude.length) throw new Error('You can not set both `fields` and `exclude` on a form')

        for (let key in schema) {
            let target: field_t | CompoundSchemaMetadata

            if (excludesLength && exclude.includes(key)) continue
            else if (fieldsLength && !fields.includes(key)) continue

            target = schema[key]
            template += match(key, target, {}, configuration)
        }

        return template;

        function match(name: string,
            fieldTypeMetadata: field_t | CompoundSchemaMetadata, extraProps: html_element.ElementProperties = {},
            configuration: FormConfigMetadata): string {
            if ('required' in extraProps)
                extraProps.required = 'required'
            let inputDivOptions = {}
            let DIV = (options: html_element.ElementProperties, ...children: string[]) => Div(options, configuration, ...children)

            switch (fieldTypeMetadata) {
                case String:
                    return DIV({}, Label(name, {}, configuration), DIV(inputDivOptions, Input(name, 'text', extraProps, configuration)))
                    break;
                case Date:
                    return DIV({}, Label(name, {}, configuration), DIV(inputDivOptions, Input(name, 'date', extraProps, configuration)))
                    break;
                case Number:
                    return DIV({}, Label(name, {}, configuration), DIV(inputDivOptions, Input(name, 'number', extraProps, configuration)))
                    break;
                case Boolean:
                    return DIV({}, Label(name, {}, configuration), DIV(inputDivOptions, Input(name, 'checkbox', extraProps, configuration)))
                    break;
                default:
                    // Compund schema metadata
                    if (!('type' in fieldTypeMetadata))
                        return ''
                    // throw TypeError('An invalid type descriptor was passed to describe a field "' + key + '"')
                    let attrs: any = { ...fieldTypeMetadata }
                    delete attrs.type
                    delete attrs.set
                    delete attrs.validators

                    return match(name, fieldTypeMetadata.type, attrs, configuration)

            }
        }
    }

    export class Form {
        static #ref_count = 0
        protected _schema!: Schema
        protected _fields?: string[]
        protected _exclude?: string[]
        protected layout_pack: layout_t
        constructor(private readonly _incomingData?: any, private readonly _args?: { instance: any }) {
            Form.#ref_count++
        }

        private _render(renderType = <form_render_t>'div') {
            let tag = 'form_' + Form.#ref_count
            let config = this.configure(tag)
            return createFormTemplate({ ...config, renderType })
        }
        asP() {
            return this._render('p')
        }
        asDiv() {
            return this._render('div')
        }
        toString() {
            return this._render()
        }
        /**
         * Configure your form from here
         * @returns Metadata to configure the form
         */
        protected configure(assignedTag: string): FormConfigMetadata {
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