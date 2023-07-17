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
            let classes = transformations.$cssClasses || []
            let loop=true
            for (let field in classes) {
                switch (field) {
                    case 'textarea':
                    case 'input':

                        if (element.isTextInputElement()) {
                            element.addCssClass((classes as any)[field])
                            loop=false
                        }
                        break;
                }
                if(!loop) break
            }
        }

    }
}

export function setFormPlugins(formGroup: number, configuredPlugis: string[]) {
    Configuration.set(formGroup, configuredPlugis)
}