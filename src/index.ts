import * as tools from './tools/index'
import { BaseElement, ContainerElement, InputElement, LabelElement, SelectElement, TextAreaElement } from './classes/elements'

namespace FORM_LIB {




    function generateFieldElement(name: string, naiveMetadataArg: field_metadata_t, resolvedCompundMetadataArg: any = {}, attrs = <any>{}): BaseElement {
        let instance: BaseElement | null = null
        let type: input_type_t | null = null
        let { choices = null, default: _default = null, rows = null, cols = null, specificType } = <CompoundSchemaMetadata>resolvedCompundMetadataArg
        let value = attrs.value || _default

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

        if (choices?.length) {
            if (!specificType)
                instance = new SelectElement(choices, attrs.value || _default)
            else if (specificType == 'radio') {
                return new ContainerElement('div',
                    new Array<0>(choices.length).fill(
                        0
                    ).map((_, i) => {
                        let chcs = choices!
                        let fieldId = (attrs.id ? attrs.id + '_' : '') + chcs[i]
                        let value = chcs[i]

                        return new ContainerElement('div',
                            [
                                new LabelElement(value).addAttrs({ for: fieldId }),
                                new InputElement('radio').addAttrs({ name, value, id: fieldId, checked: attrs.value == value || _default == value })
                            ]
                        )
                    })
                )
            }

            delete resolvedCompundMetadataArg.choices
        } else {
            instance = /number/.test(typeof rows + typeof cols) ? new TextAreaElement(rows || 2, cols || 20, value) :
                new InputElement(specificType || type!, value);
        }
        if (instance) {
            delete attrs.value
            'default' in resolvedCompundMetadataArg && delete resolvedCompundMetadataArg.default
            'specificType' in resolvedCompundMetadataArg && delete resolvedCompundMetadataArg.specificType
            resolvedCompundMetadataArg.required && instance.addAttrs({ required: 'required' }) || delete resolvedCompundMetadataArg.required
            'enum' in resolvedCompundMetadataArg && instance.addAttrs({ pattern: resolvedCompundMetadataArg.enum }) && delete resolvedCompundMetadataArg.enum

            instance.addAttrs({ ...resolvedCompundMetadataArg, ...attrs, name })
            return instance
        }
        else throw Error('Could not create an element to compose the layout')

    }


    function generateDefaultLayout(metadata: FormConfigMetadata, containerTag: form_render_type_t = 'div', _incomingData = <any>{}, form: Form) {
        let children: BaseElement[] = []
        let wrapChild = /(div|table)/.test(containerTag)
        let childWrapperTag = ''
        let rowTag = ''
        let { schema, refPrefix = '' } = metadata

        if (wrapChild)
            childWrapperTag = containerTag == 'table' ? 'td' : containerTag

        rowTag = containerTag == 'table' ? 'tr' : containerTag

        for (let name in schema) {
            let fieldCssId = (refPrefix.length ? refPrefix + '_' : '') + name
            let outerWrapper: ContainerElement<BaseElement>
            let value = _incomingData[name]
            let attrs = { id: fieldCssId, }
            let field = generateFieldElement(name, schema[name] as field_metadata_t, {}, value && { ...attrs } || attrs)
            let label = new LabelElement(name).addAttrs({ 'for': fieldCssId })
            let fieldWrapper = new ContainerElement(childWrapperTag, [field], {})
            let labelWrapper = new ContainerElement(childWrapperTag, [label], {})

            outerWrapper = new ContainerElement(rowTag, [labelWrapper, fieldWrapper]).addAttrs({ 'class': form.fieldCssClass })
            children.push(outerWrapper)
        }
        return children
    }


    export abstract class Form extends BaseElement implements IForm {
        static #ref_count = 0

        protected layoutPack: layout_t
        fieldCssClass = ''


        /**
         * @deprecated _incomingData should not be used to set the instance, use `_args.instance` instead 
         * @param _incomingData a javascript object having the keys from the schema and their values
         * @param _args 
         */
        constructor(private readonly _incomingData = <any>{}, private readonly _args?: { instance: any }) {
            super('form')
            Form.#ref_count++
        }


        /**@override */
        protected _render(renderType = <form_render_type_t>'div') {
            let config = this.#_validateConfiguration()
            let schema = Form.#_filterSchema(config)


            this.children = generateDefaultLayout({ ...config, schema }, renderType, this._incomingData || {}, this)
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

tools.registerModule(module, FORM_LIB, 'FORM_LIB')
