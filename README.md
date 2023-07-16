# form-lib

> A library to create html forms from schema like objects in javascript (inpired by you know which framework).

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
<!-- Example form -->
<form id='form_1'>
    <div>
        <div><label for='form_1_name'>Name</label></div>
        <div><input type='text' name='name' id='form_1_name'></div>
    </div>
    <div>
        <div><label for='form_1_gender'>Gender</label></div>
        <div><input type='text' name='gender' id='form_1_gender'></div>
    </div>
    <div>
        <div><label for='form_1_isRegistered'>Is registered</label></div>
        <div><input type='checkbox' name='isRegistered' id='form_1_isRegistered'></div>
    </div>
    <div>
        <div><label for='form_1_age'>Age</label></div>
        <div><input type='number' required='true' min='0' name='age' id='form_1_age'></div>
    </div>
    <div>
        <div><label for='form_1_date_of_birth'>Date of birth</label></div>
        <div><input type='date' name='date_of_birth' id='form_1_date_of_birth'></div>
    </div>
</form>
```

## Usage

Depend on this library in the node environment or in the browser (via the `FORM_LIB` global object).

## Capabilities

- Uses very simple configuration, the most basic of configuration requires you implementing the `configure` method

- Derived label names from `camelCase` or `snake_case`

- Has a private internal configurable API for future features

- Optionally ignore the form tag by setting `this.FormTag=false`

- Able to generate html in 3 modes, `paragraph` *(form.asP())*, `table` *form.asTable()* and `div (default)` *form.asDiv()*

- Able to fill the fields in the form based on the first argument of the form (incoming data)

- Does partial validation of date values

- Sets some html attributs `id`, `value`, `selected`, e.t.c (try out for more)

## Pending features

- Incorporate bootstrap css classes for the form
