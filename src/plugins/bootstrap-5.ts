
/**
 * Format suggested by @wazabanda
 * @returns 
 */


let plugin: ISchemaPlaginFn = function plugin() {
    return {
        schema: {

            $cssClasses: {
                input: 'form-control',
                textarea: 'form-control',
                select: 'form-select',
            },
            $fieldCssClasses: {
                input: 'input-group',
                textarea: 'input-group',
                select: 'input-group',
            }
        }
    }
}

export default plugin




