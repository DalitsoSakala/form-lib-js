let { Form } = require('../dist/index-commonjs')
let fs = require('fs')
let { join } = require('path')


let schema = {
    name: String,
    age:{
        min:8,
        type:Number
    },
    isGrownUp:Boolean,
    gender:{
        type:String,
        choices:['Male','Female','None']
    },
    shortBioInfo:{
        type:String,
        rows:4

    }
}

class MyForm extends Form {
    configure() {
        this.plugins = ['bootstrap5']
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