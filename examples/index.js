let { Form } = require('../dist/index')
let fs = require('fs')
let { join } = require('path')

let schema = {
    libraryName: {
        default: '@jsnodor',
        type: String,
        required: true
    },
    applicableEnvironment: {
        type: String,
        default: 'web',
        choices: ['node', 'web'],
    },
    configurationRequired: Boolean,
    numberOfVersions: {
        type: Number,
        min: 0,
        required: true,
        enum: /\w/
    },
    date_created: {
        type: Date,
        default: new Date
    }
}



class MyForm extends Form {
    constructor() {
        super(null)
        this.formCssClass = 'form-horizontal'
        this.fieldCssClass = 'd-block'
    }
    configure(tag) {
        return {
            tag,
            schema,
        }
    }
}

fs.writeFileSync(join(__dirname, 'example.html'), '<!-- Example form -->' + new MyForm().asDiv(), { encoding: 'utf-8' })