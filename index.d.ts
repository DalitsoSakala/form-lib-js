
declare type field_metadata_t = DateConstructor | StringConstructor | NumberConstructor | BooleanConstructor | CompoundSchemaMetadata

declare type layout_t = 'bs5' | undefined


declare type form_render_type_t = 'div' | 'p' | 'table'

declare type text_input_type_t = 'text' | 'number' | 'date' | 'datetime' | 'color' | 'phone' | 'email' | 'password'

declare type input_type_t = 'checkbox' | 'radio' | text_input_type_t;

/**
 * When `fields` and `exclude` are not provided, all fields are rendered
 */
declare interface FormConfigMetadata {
    form: IForm,
    schema: Schema
    fields?: string[]
    exclude?: string[]
    refPrefix?: string
    renderType?: form_render_type_t
}




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


/**Settings that can be assigned to the schema */
declare interface SchemaSettings {
    $sharedCssClasses?: string
    $cssClasses?: {
        [k: string]: string
    }
}


declare interface Schema {
    [k: string]: field_metadata_t | CompoundSchemaMetadata | SchemaSettings
}

interface IElementType {
    isTextInputElement(): boolean
}

declare interface IForm {

    configure(refPrefix: string): FormConfigMetadata

    asP(): string
    asDiv(): string
    asTable(): string
}


/**Plugin function used to configure the schema */
interface ISchemaPlaginFn {
    (): { schema: SchemaSettings }
}
declare interface KVMap {
    [k: number | string]: any
}
declare interface IElement extends IElementType {
    get Props(): any
    prepareRender()
    addAttrs(attrs: any): IElement
    addCssClass(className: string): IElement

    getAttr(attributeName: string): any
    rmAttrs(...attrs: string[]): IElement
    toString(): string
}