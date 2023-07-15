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
    configure() {
        return {
            schema
        }
    }
}

console.log(new MyForm() + '')