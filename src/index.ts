

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
        cols?: number | string
        rows?: number | string
        choices?: any[] | null
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
        refPrefix?: string
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


    function generateFieldElement(name: string, naiveMetadataArg: field_metadata_t, resolvedCompundMetadataArg: any = {}, attrs = <any>{}): Element {
        let instance: Element | null = null
        let type: input_type_t | null = null
        let { choices = null, default: _default = null, rows = null, cols = null, specificType } = <CompoundSchemaMetadata>resolvedCompundMetadataArg

        switch (naiveMetadataArg) {
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
                let _metadata = <CompoundSchemaMetadata>naiveMetadataArg
                let truncated: any = {}
                if (!_metadata.type)
                    // type = 'text'
                    throw new Error('A valid type is required')
                Object.assign(truncated, _metadata)
                delete truncated.type
                return generateFieldElement(name, _metadata.type, truncated, attrs)
        }
        console.log(attrs)
        if (choices?.length) {
            if (!specificType)
                instance = new SelectElement(choices, _default)
            else if (specificType == 'radio') {
                return new ContainerElement('div',
                    new Array<0>(choices.length).fill(
                        0
                    ).map((_, i) => {
                        let chcs = choices!
                        let fieldId = (attrs.id ? attrs.id + '_' : '') + chcs[i]
                        
                        return new ContainerElement('div',
                            [new LabelElement(chcs[i]).addAttrs({ for: fieldId }), new InputElement('radio').addAttrs({ name, value: chcs[i], id: fieldId })]
                        )
                    })
                )
            }

            delete resolvedCompundMetadataArg.choices
        } else if (specificType) {
            instance = new InputElement(specificType, _default);
        } else {
            instance = /number/.test(typeof rows + typeof cols) ? new TextAreaElement(rows || 2, cols || 20, _default) : new InputElement(type!, _default);
        }
        if (instance) {
            'default' in resolvedCompundMetadataArg && delete resolvedCompundMetadataArg.default
            'specificType' in resolvedCompundMetadataArg && instance.addAttrs({ type: specificType }) && delete resolvedCompundMetadataArg.specificType
            resolvedCompundMetadataArg.required && instance.addAttrs({ required: 'required' }) || delete resolvedCompundMetadataArg.required
            'enum' in resolvedCompundMetadataArg && instance.addAttrs({ pattern: resolvedCompundMetadataArg.enum }) && delete resolvedCompundMetadataArg.enum

            console.log(resolvedCompundMetadataArg)
            instance.addAttrs({ ...resolvedCompundMetadataArg, ...attrs, name })
            return instance
        }
        else throw Error('Could not create an element to compose the layout')

    }

    function generateDefaultLayout(metadata: FormConfigMetadata, containerTag: form_render_t = 'div') {
        let children: Element[] = []
        let wrapChild = /(div|table)/.test(containerTag)
        let childWrapperTag = ''
        let rowTag = ''
        let { schema, refPrefix = '' } = metadata

        if (wrapChild)
            childWrapperTag = containerTag == 'table' ? 'td' : containerTag

        rowTag = containerTag == 'table' ? 'tr' : containerTag

        for (let name in schema) {
            let fieldCssId = (refPrefix.length ? refPrefix + '_' : '') + name
            let outerWrapper: ContainerElement<Element>
            let field = generateFieldElement(name, schema[name] as field_metadata_t, {}, { id: fieldCssId })
            let label = new LabelElement(name).addAttrs({ 'for': fieldCssId })
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
        /**
         * Always read from this function when assigning css attributes
         */
        get Props(): any {
            let props = { ...this.attrs }
            let { cssClass, cssId } = this

            if (this.cssClass?.length)
                props['class'] = cssClass + (' ' + this.attrs['class'] || '')
            if (this.cssId?.length)
                props['id'] = cssId
            else delete props['id']

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
                if (attr == 'id') {
                    this.cssId = value
                    continue
                }
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

    export abstract class Form extends Element {
        static #ref_count = 0

        protected layoutPack: layout_t
        protected fieldCssClass = ''


        /**
         * 
         * @param _incomingData a javascript object having the keys from the schema and their values
         * @param _args 
         */
        constructor(private readonly _incomingData?: any, private readonly _args?: { instance: any }) {
            super('form')
            Form.#ref_count++
        }


        /**@override */
        protected _render(renderType = <form_render_t>'div') {
            let config = this.#_validateConfiguration()
            let schema = Form.#_filterSchema(config)


            this.children = generateDefaultLayout({ ...config, schema }, renderType)
            this.useTag = this.FormTag
            this.FormCssId = this.FormCssId || config.refPrefix || ''
            return super._render()
        }
        static #_filterSchema(config: FormConfigMetadata) {
            let orderedSchema = <any>null
            let { exclude = null, fields = null, schema } = config
            if (exclude) {
                for (let name in schema)
                    if (exclude.includes(name))
                        delete schema[name]
            }
            else if (fields) {
                orderedSchema = {}
                for (let field of fields)
                    orderedSchema[field] = schema[field]
            }
            return <Schema>orderedSchema || schema

        }
        #_validateConfiguration() {
            let reference = 'form_' + Form.#ref_count
            let config = this.configure(reference)
            let { exclude = null, fields = null } = config
            if (exclude && fields) throw new Error('You can configure both `fields` and `exclude')
            return config
        }
        /**
         * Configure your form from here
         * @param refPrefix Tag used to prefix css id's of this form (if `cssId` is not assigned) 
         * and it's children.
         * It should have an entry in the object returned by this function otherwise this prefix is
         * ignored.
         * @returns Metadata to configure the form
         */
        abstract configure(refPrefix: string): FormConfigMetadata


        asP() {
            return this._render('p')
        }
        asDiv() {
            return this._render('div')
        }
        asTable() {
            return this._render('table')
        }


        protected set FormCssId(cssId: string) {
            this.cssId = cssId
        }
        get FormCssId() {
            return this.cssId
        }

        protected set FormCssClass(cssClass: string) {
            this.cssClass = cssClass
        }
        protected set FormTag(useFormTag: boolean) {
            this.useTag = useFormTag
        }
        protected get FormTag() {
            return this.useTag
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

    Object.defineProperties(FORM_LIB, {
        Form: {
            writable: false,
            configurable: false,
        }
    })


    if (isBrowser())
        Object.assign(global, { FORM_LIB })
    else Object.assign(global, FORM_LIB)
}(this));