import * as plugins from '../plugins/index'

let Configuration: Map<number, string[]> = new Map

function isAdvancedFieldWrapperClassConfigMapping(mapping: SchemaCssMappingConfig, mappingName: string, pluginName: string = 'default') {
    if (typeof mapping == 'string') return false
    if (Array.isArray(mapping))
        return true
    throw new Error(`The mapping name "${mappingName}" in the plugin "${pluginName}" does not have a valid format`)
}

function decodeAndAssignCssClassFromAdvancedMapping(element: IElement, mapping: AlternateClassesValueConfig[]) {
    for (let cfg of mapping) {
        if (cfg.exclude) {console.log('loyo',element.Props,cfg.exclude,element.hasAttrIn(cfg.exclude))
            if (element.hasAttrIn(cfg.exclude))
                continue
        } else if (cfg.only) {
            if (!element.hasAttrIn(cfg.only))
                continue
        }
        element.addCssClass(cfg.classes)
    }

}

function handleCssClassAssignment(element: IElement, mapping: SchemaCssMappingConfig, mappingName: string, pluginName: string) {

    if (isAdvancedFieldWrapperClassConfigMapping(mapping as SchemaCssMappingConfig, mappingName, pluginName))
        return decodeAndAssignCssClassFromAdvancedMapping(element, mapping as AlternateClassesValueConfig[])
    else return element.addCssClass(mapping as string)
}

export function schemaPluginTransformElement(element: IElement, settings: SchemaSettings, pluginName: string = '') {

    let containedElementTagName = (element as IFieldContainer).ContainedFieldElement as (string | undefined)
    let elementTag = element.Tag
    let fieldName: string | undefined
    let settingsGroup: IMapping<SchemaCssMappingConfig> | undefined
    let mapping: SchemaCssMappingConfig

    // There are only 2 possible cases:
    // The element is either a wrapper element (i.e a div) /
    //  or it is an entry element (i.e select, input)
    if (containedElementTagName?.length) {
        // This is a wrapper element because contained element is not an empty string
        // So we shall target the field `$fieldWrapperCssClasses`
        // The contained element is extracted from the value of `containedElementName`

        settingsGroup = settings.$fieldWrapperCssClasses
        if (!settingsGroup) return
        mapping = settingsGroup[containedElementTagName]
        if (!mapping) return
        return handleCssClassAssignment(element, mapping, '$fieldWrapperCssClasses', pluginName)



    } else {

        settingsGroup = settings.$cssClasses

        if (settingsGroup) {
            fieldName = element.getAttr('name')
            if (!fieldName) return
            mapping = settingsGroup[fieldName]
            if (!mapping) return
            void handleCssClassAssignment(element, mapping, '$cssClasses', pluginName)

        }



        settingsGroup = settings.$sharedCssClasses

        if (settingsGroup) {
            elementTag = element.Tag
            mapping = settingsGroup[elementTag]
            if (!mapping) return
            void handleCssClassAssignment(element, mapping, '$sharedCssClasses', pluginName)
        }
    }

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