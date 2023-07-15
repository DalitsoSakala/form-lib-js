# form-lib

A library to create html forms from schema like objects in javascript following the pattern of an orm

## Example

```js


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

```

Will generate

```html
<div><label name='name'>name</label><input name='name' type='text'></div>
<div><label name='gender'>gender</label><input name='gender' type='text'></div>
<div><label name='isRegistered'>is registered</label><input name='isRegistered' type='checkbox'></div>
<div><label name='age'>age</label><input name='age' type='number' min='0' required='true'></div>
<div><label name='date_of_birth'>date of birth</label><input name='date_of_birth' type='date'></div>
```

## Usage

Depend on this library in the node environment or in the browser (via the `FORM_LIB` global object).
