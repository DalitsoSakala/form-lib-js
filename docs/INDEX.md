# Usage Guide for Form Lib

## Accessing the API

- In the browser the API is wrapped in the global `window.FORM_LIB` object.

```html
...

<script src="PATH/TO/FORM_LIB/dist/index.js"></script>

<script>
    let Form = FORM_LIB.Form;
</script>

```

- In note, the API can be accessed directly

```js

let { Form } = require('@jsnodor/form-lib')

```

## Creating a form instance

1. Extent the `Form` class from the API.

2. Provide configuration by implementing the `configure` method

```js
const mySchema = {
    password:String,
    username:{
        type:String,
        default:'@DalitsoSakala'
    },
    email:String
}
class UserForm extends Form {
    configure(tag){
        return {
            refPrefix:tag, // The value of refPrefix determines the prefix in front of the form id and also each field's if
            schema:mySchema,
            exclude: ['password']
        }
    }
}

```

3. To obtain the HTML of the element you can call 'toString()' on the instance of the class.
