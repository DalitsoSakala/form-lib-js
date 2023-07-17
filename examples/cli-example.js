let { Form } = require('../dist/index-commonjs')
let fs = require('fs')
let { join } = require('path')


let schema = {
    name: String,
    color:{
        type: String,
        specificType:'color'
    },
    gender: {
        choices:['male','female'],
        type:String,
        default:'male'
    },
    isRegistered: Boolean,
    age: {
        type: Number,
        min: 0,
        required: true
    },
    date_of_birth: Date
}

class MyForm extends Form {
    configure() {
        return {
            schema
        }
    }
}


fs.writeFileSync(
    join(__dirname, 'cli-example-output.html'),
    '<!-- Example form -->' + new MyForm(),
    { encoding: 'utf-8' }
)