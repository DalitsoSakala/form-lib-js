
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
            }
        }
    }
}

export default plugin




