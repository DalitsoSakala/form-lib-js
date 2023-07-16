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
    applicability: {
        type: String,
        specificType: 'radio',
        choices: ['web', 'express', 'react', 'vue', 'angular'],
    },
    configurationRequired: Boolean,
    numberOfVersions: {
        type: Number,
        min: 0,
        required: true,
        enum: /\w/
    },
    brand_color: {
        type: String,
        specificType: 'color',
        default: '#0000ee'
    },
    date_created: {
        type: Date,
        specificType: 'datetime',
        default: new Date
    },
    descriptionOf_library: {
        type: String,
        rows: 3
    },
    timeOfReview: {
        type: String,
        specificType: 'time',
        default: '11:30'
    }
}



class MyForm extends Form {
    constructor() {
        super(null)
        this.formCssClass = 'form-horizontal'
        this.fieldCssClass = 'd-block'
        this.formTag = false
    }
    configure(tag) {
        return {
            tag,
            schema,
        }
    }
}


fs.writeFileSync(
    join(__dirname, 'example.html'),
    '<!-- Example form -->' + new MyForm().asTable(),
    { encoding: 'utf-8' }
)