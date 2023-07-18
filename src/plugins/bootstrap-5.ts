
/**
 * Format suggested by @wazabanda
 * @returns 
 */


export let plugin: ISchemaPlaginFn = function plugin() {
    return {
        schema: {

            $sharedCssClasses: {
                input: 'form-control',
                textarea: 'form-control',
                select: 'form-select',
            },
            $fieldWrapperCssClasses: {
                input: 'input-group',
                textarea: 'input-group',
                select: 'input-group',
            }
        }
    }
}





