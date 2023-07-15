let { Form } = require('../dist/index')

let schema = {
    name: String,
    gender: String,
    isRegistered: Boolean,
    age: {
        type: Number,
        min: 0,
        required: true
    },
    date_of_birth: Date
}



class MyForm extends Form {
    configure(tag) {
        return {
            tag,
            schema,
            fields:['name','age','date_of_birth']
        }
    }
}

console.log(new MyForm().asDiv() + '')