
declare type field_metadata_t = DateConstructor | StringConstructor | NumberConstructor | BooleanConstructor | CompoundSchemaMetadata

declare type layout_t = 'bs5' | undefined


declare type form_render_type_t = 'div' | 'p' | 'table'

declare type input_type_t = 'text' | 'checkbox' | 'number' | 'date' | 'datetime' | 'color' | 'phone' | 'email' | 'password' | 'radio';

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


declare interface IForm {

    abstract configure(refPrefix: string): FormConfigMetadata

    asP(): string
    asDiv(): string
    asTable(): string
}


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

declare interface Schema {
    [k: string]: field_metadata_t | CompoundSchemaMetadata
}
