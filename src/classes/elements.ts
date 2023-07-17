import * as tools from '../tools/index'



export abstract class BaseElement implements IElement {
    protected attrs = <any>{}
    protected cssClass = ''
    protected cssId = ''
    protected children?: BaseElement[]
    protected hoistedChildren?: BaseElement[]
    protected hasClosingTag = true
    protected useTag = true
    constructor(private readonly tag: string) {

    }
    get Tag() {
        return this.tag
    }
    /**
     * Always read from this function when assigning css attributes
     */
    get Props(): any {
        let props = { ...this.attrs }
        let { cssClass, cssId } = this

        if (this.cssClass?.length)
            props['class'] = (cssClass + ' ' + (this.attrs['class'] || '')).trim()
        if (this.cssId?.length)
            props['id'] = cssId.trim()
        else delete props['id']

        return props
    }

    /**
     * This method is invoked just before the element renders.
     * It is safe to do any configuration you think will be useful in the render process.
     **/
    prepareRender() { }

    addCssClass(className: string) {
        let cls = this.cssClass || ''
        this.cssClass = cls + ' ' + (className || '')
        return this
    }


    addAttrs(attrs = <any>{}) {

        for (let attr in attrs) {
            let value = attrs[attr]
            if (attr == 'id') {
                this.cssId = value
                continue
            }
            if (attr == 'class') {
                this.cssClass = value
                continue
            }
            if (/^(disabled|checked|selected|novalidate|required)$/i.test(attr)) {
                if (value) {
                    value = attr
                }
                else continue
            }

            this.attrs[attr] = value
        }
        return this
    }

    getAttr(attributeName: string) {
        return this.attrs[attributeName]
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
            if (props.value && props.type) this.addAttrs({ value: tools.validateValue(props.type, props.value) })

            template += tools.setProps(`<${tag}>`, this.Props, tools)
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


export class ContainerElement<T extends BaseElement> extends BaseElement implements IFieldContainer {
    #containedField: string = ''
    #containedElementName: string = ''
    constructor(tag: string, protected readonly children: T[], attrs: any = {}, protected readonly cssClass: string = '', protected readonly cssId: string = '') {
        super(tag)
        tag.length &&
            this.addAttrs(attrs)
    }
    get ContainedField(): string {
        return this.#containedField
    }
    set ContainedField(fieldName: string) {
        this.#containedField = fieldName.trim()
    }
    get ContainedFieldElement(): string {
        return this.#containedElementName
    }
    set ContainedFieldElement(elementName: string) {
        this.#containedElementName = elementName.trim()
    }

}




export class TextAreaElement extends BaseElement {
    constructor(rows: number | string = 2, cols: number | string = 8, value: any = '') {
        super('textarea')
        this.addAttrs({ cols, rows })

        if (value !== null && value !== undefined)
            this.addAttrs({ value })
    }

}


export class InputElement extends BaseElement {
    constructor(type: input_type_t = 'text', value: any = null) {
        super('input')
        this.addAttrs({ type })

        if (value !== null && value !== undefined)
            this.addAttrs({ value })
        this.hasClosingTag = false
    }

}


export class TextNode extends BaseElement {
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


export class LabelElement extends BaseElement {
    constructor(formControlName: string) {
        super('label')
        this.children = [new TextNode(tools.readableString(formControlName))]
    }
}


export class OptionElement extends BaseElement {
    constructor(text: string, value: string, selected = false) {
        super('option')
        this.addAttrs({ value, selected })
        this.children = [new TextNode(text)]
    }
}


export class SelectElement extends BaseElement {
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
