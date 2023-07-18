import * as plugins from '../plugins/index'

let Configuration: Map<number, string[]> = new Map


export function schemaPluginTransformElement(element: IElement, settings: SchemaSettings, pluginName: string = '') {

    let elementCssClasses: any = {}
    let classesToApply = ''

    // Input control
    elementCssClasses = Object.assign(settings.$sharedCssClasses || {})
    classesToApply = elementCssClasses[element.Tag] || ''
    classesToApply.trim().length && element.addCssClass(classesToApply)

    // Input control
    elementCssClasses = Object.assign(settings.$cssClasses || {})
    if (pluginName.length && Object.keys(elementCssClasses).length) throw new Error(`The plugin "${pluginName}" should not have the field "$cssClasses"`)
    classesToApply = elementCssClasses[element.getAttr('name')] || ''
    classesToApply.trim().length && element.addCssClass(classesToApply)


    // Input control wrapper
    elementCssClasses = Object.assign(settings.$fieldWrapperCssClasses || {})
    classesToApply = elementCssClasses[(element as IFieldContainer).ContainedFieldElement] || ''

    classesToApply.trim().length && element.addCssClass(classesToApply)
}



export function applyPluginsToElement(element: IElement, configGroup: number) {
    let configuredPlugis = Configuration.get(configGroup)

    if (!configuredPlugis?.length) return

    for (let p of configuredPlugis) {
        let plugin = (plugins as KVMap)[p] as ISchemaPlaginFn
        let config = plugin()

        if ('schema' in config) {
            schemaPluginTransformElement(element, config.schema, p)
        }

    }
}

export function setFormPlugins(formGroup: number, configuredPlugis: string[]) {
    Configuration.set(formGroup, configuredPlugis)
}