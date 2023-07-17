import * as plugins from '../plugins/index'

let Configuration: Map<number, string[]> = new Map

export function applyPluginsToElement(element: IElement, configGroup: number) {
    let configuredPlugis = Configuration.get(configGroup)

    if (!configuredPlugis?.length) return

    for (let p of configuredPlugis) {
        let plugin = (plugins as KVMap)[p] as ISchemaPlaginFn
        let config = plugin()

        if ('schema' in config) {
            let transformations = config.schema
            let elementCssClasses = transformations.$cssClasses || {}
            let classesToApply = elementCssClasses[element.Tag] || ''

            classesToApply.trim().length && element.addCssClass(classesToApply)


        }

    }
}

export function setFormPlugins(formGroup: number, configuredPlugis: string[]) {
    Configuration.set(formGroup, configuredPlugis)
}