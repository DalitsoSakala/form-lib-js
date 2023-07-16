

namespace FORM_LIB {
    type field_metadata_t = DateConstructor | StringConstructor | NumberConstructor | BooleanConstructor | CompoundSchemaMetadata
    declare type form_render_t = 'div' | 'p' | 'table'
    declare interface CompoundSchemaMetadata {
        type: field_metadata_t
        /** Add more specificity to the intended type*/
        specificType?: input_type_t
        required?: boolean
        pattern?: string | RegExp
        default?: any
        min?: number
        max?: number
        choices?: any[][] | null
    }
    declare type input_type_t = 'text' | 'checkbox' | 'number' | 'date' | 'datetime' | 'color' | 'phone' | 'email' | 'password' | 'radio';
    declare type layout_t = 'bs5' | undefined
    /**
     * When `fields` and `exclude` are not provided, all fields are rendered
     */
    declare interface FormConfigMetadata {
        form: Form,
        schema: Schema
        fields?: string[]
        exclude?: string[]
        tag?: string
        renderType?: form_render_t
    }

    declare interface Schema {
        [k: string]: field_metadata_t | CompoundSchemaMetadata
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



        export function setProps(elementString: string, propertiesMap: any) {
            let propertiesString = ' ';
            for (let key in propertiesMap) {
                propertiesString += ' ' + key + '=\'' + (propertiesMap as any)[key] + '\' '
            }
            return fn_utils.insertAtIndex(elementString, propertiesString, elementString.indexOf('>'))
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


    }


    function generateFieldElement(name: string, metadata: field_metadata_t, extraData: any = {}): Element {
        let instance: Element | null = null
        let type: input_type_t | null = null
        switch (metadata) {
            case Date:
                type = 'date'
                break
            case String:
                type = 'text'
                break
            case Number:
                type = 'number'
                break
            case Boolean:
                type = 'checkbox'
                break
            default:
                // CompoundMetadata
                let _metadata = <CompoundSchemaMetadata>metadata
                let extraData: any = {}
                if (!_metadata.type)
                    // type = 'text'
                    throw new Error('A valid type is required')
                Object.assign(extraData, _metadata)
                delete extraData.type
                return generateFieldElement(name, _metadata.type, extraData)
        }
        let { choices = null, default: _default = null, rows = null, cols = null, specificType } = extraData

        if (choices) {
            if (!specificType)
                instance = new SelectElement(extraData.choices, _default)
            else if (specificType == 'radio') {
                return new ContainerElement('div',
                    new Array<0>(choices.length).fill(
                        0
                    ).map((_, i) => {
                        return new ContainerElement('div',
                            [new LabelElement(choices[i]), new InputElement('radio').addAttrs({ name, value: choices[i], id: choices[i] })]
                        )
                    })
                )
            }

            delete extraData.choices
        } else if (specificType) {
            instance = new InputElement(specificType, _default);
        } else {
            instance = /number/.test(typeof rows + typeof cols) ? new TextAreaElement(rows || 2, cols || 20, _default) : new InputElement(type!, _default);
        }
        if (instance) {
            'default' in extraData && delete extraData.default
            specificType in extraData && instance.addAttrs({ type: specificType }) && delete extraData.specificType
            extraData.required && instance.addAttrs({ required: 'required' }) || delete extraData.required
            'enum' in extraData && instance.addAttrs({ pattern: extraData.enum }) && delete extraData.enum

            instance.addAttrs({ name, ...extraData, id: name })
            return instance
        }
        else throw Error('Could not create an element to compose the layout')

    }

    function generateDefaultLayout(schema: Schema, containerTag: form_render_t = 'div') {
        let children: Element[] = []
        let wrapChild = /(div|table)/.test(containerTag)
        let childWrapperTag = ''
        let rowTag = ''

        if (wrapChild)
            childWrapperTag = containerTag == 'table' ? 'td' : containerTag

        rowTag = containerTag == 'table' ? 'tr' : containerTag

        for (let name in schema) {
            let outerWrapper: ContainerElement<Element>
            let field = generateFieldElement(name, schema[name] as field_metadata_t)
            let label = new LabelElement(name)
            let fieldWrapper = new ContainerElement(childWrapperTag, [field], {})
            let labelWrapper = new ContainerElement(childWrapperTag, [label], {})

            outerWrapper = new ContainerElement(rowTag, [labelWrapper, fieldWrapper])
            children.push(outerWrapper)
        }
        return children
    }

    abstract class Element {
        protected attrs = <any>{}
        protected cssClass = ''
        protected cssId = ''
        protected children?: Element[]
        protected hasClosingTag = true
        protected useTag = true
        constructor(private readonly tag: string) {

        }
        get Props(): any {
            let props = { ...this.attrs }
            let { cssClass, cssId } = this

            if (this.cssClass?.length)
                props['class'] = cssClass + (' ' + this.attrs['class'] || '')
            if (this.cssId?.length)
                props['id'] = cssId

            return props
        }

        /**
         * This method is invoked just before the element renders.
         * It is safe to do any configuration you think will be useful in the render process.
         **/
        prepareRender() { }

        addAttrs(attrs = <any>{}) {
            for (let attr in attrs) {
                let value = attrs[attr]
                if (/^(disabled|checked|selected)$/i.test(attr))
                    if (value) switch (attr) {
                        case 'disabled':
                            value = 'disabled';
                            break
                        case 'checked':
                            value = 'checked';
                            break
                        case 'selected':
                            value = 'selected';
                            break
                    }
                    else continue
                this.attrs[attr] = attrs[attr]
            }
            return this
        }
        rmAttrs(...attrs: string[]) {
            for (let attr of attrs)
                delete this.attrs[attr]
            return this
        }

        protected _render() {
            let template = ''
            let { tag } = this
            this.prepareRender()
            if (tag.length && this.useTag) {
                let props = this.Props
                if (props.value && props.type) this.addAttrs({ value: html_element.validateValue(props.type, props.value) })
                template += html_element.setProps(`<${tag}>`, this.Props)
            }


            if (this.children?.length)
                for (let child of this.children!)
                    template += child.toString()

            if (this.hasClosingTag && tag.length && this.useTag)
                template += `</${tag}>`
            tag == 'tr' && console.log(template)

            return template
        }

        toString() {
            return this._render()
        }

    }

    class ContainerElement<T extends Element> extends Element {
        constructor(tag: string, protected readonly children: T[], attrs: any = {}, protected readonly cssClass: string = '', protected readonly cssId: string = '') {
            super(tag)
            tag.length &&
                this.addAttrs(attrs)
        }
    }

    class TextAreaElement extends Element {
        constructor(rows: number | string = 2, cols: number | string = 8, value: any = '') {
            super('textarea')
            this.addAttrs({ cols, rows })

            if (value !== null && value !== undefined)
                this.addAttrs({ value })
        }
    }
    class InputElement extends Element {
        constructor(type: input_type_t = 'text', value: any = null) {
            super('input')
            this.addAttrs({ type })

            if (value !== null && value !== undefined)
                this.addAttrs({ value })
            this.hasClosingTag = false
        }
    }
    class TextNode extends Element {
        constructor(private readonly text: string) {
            super('')
        }
        get Props(): any {
            return {}
        }
        protected _render(): string {
            return this.text
        }
    }

    class LabelElement extends Element {
        constructor(formControlName: string) {
            super('label')
            this.children = [new TextNode(fn_utils.readableString(formControlName))]
            this.addAttrs({ 'for': formControlName })
        }
    }
    class OptionElement extends Element {
        constructor(text: string, value: string, selected = false) {
            super('option')
            this.addAttrs({ value, selected })
            this.children = [new TextNode(text)]
        }
    }
    class SelectElement extends Element {
        constructor(choices: any[], defaultValue: any) {
            super('select')
            let children: OptionElement[] = []

            for (let choice of choices) {
                let isSelected = defaultValue ? defaultValue == choice : false
                let instance = new OptionElement(choice, choice, isSelected)
                children.push(instance)
            }
            this.children = children
        }
    }

    export class Form extends Element {
        static #ref_count = 0

        protected layoutPack: layout_t
        protected formTag = true
        protected fieldCssClass = ''



        constructor(private readonly _incomingData?: any, private readonly _args?: { instance: any }) {
            super('form')
            Form.#ref_count++
            this.cssId = 'form_id_' + Form.#ref_count
        }

        /**@override */
        protected _render(renderType = <form_render_t>'div') {
            let tag = 'form_' + Form.#ref_count
            let config = this.configure(tag)
            this.children = generateDefaultLayout(config.schema, renderType)
            this.useTag = this.FormTag
            return super._render()
        }
        get FormTag() {
            return this.formTag
        }
        asP() {
            return this._render('p')
        }
        asDiv() {
            return this._render('div')
        }
        asTable() {
            return this._render('table')
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