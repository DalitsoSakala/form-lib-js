
/**
 * Format suggested by @wazabanda
 * @returns 
 */

function apply() {
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

const NAME = 'bootstrap-5'



const API = {
}

API[NAME] = apply

export default API