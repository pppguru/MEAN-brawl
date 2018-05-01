import $ from 'jquery';
import validator from 'validator';

//validates overall form to toggle submit
const formValid = (event) => {
    //hacks for the date plugin
    let requiredValuesExist = true,
    checkboxesAreSelected = true,
    //the horrible date plugin hack
    input = event._isAMomentObject || !('validation' in event.target.dataset) ? {name: "bday", value: $('#bday').val(), dataset: {validation: "date,required" }} : event.target,
    validations = input.dataset.validation.split(','),
    //doing more hacks for this damn date plugin
    form = (input.name === "bday") ? $('#bday').closest('form') : $(input).closest('form');

    //Validate the input field you're typing in. This gives us real time status.
    validate(event);

    //lastly check if there are values in required fields
    $(form).find('label span').closest('li').each(function(){
        requiredValuesExist = requiredValuesExist && ($(this).find('input,select,textarea').val().length > 0);
    });

    $(form).find('label span').closest('ul').each(function(){
        let input = $(this).find('input')[0];
        if($(input).attr('type') === "checkbox"){
            let minChecks = input.dataset.min ? minCheckboxes(input) : true;
            let maxChecks = input.dataset.max ? maxCheckboxes(input) : true;
            checkboxesAreSelected = checkboxesAreSelected && minChecks && maxChecks;
        }
    });

    //Check to see if any errors are showing.
    let formErrors = $(form).find('.field-error').length > 0;

    //is the current input invalid or any other errors showing?
    if(formErrors || !requiredValuesExist || !checkboxesAreSelected){
        $(form).find('input[type="submit"]').attr('disabled','disabled');
    }else{
        $(form).find('input[type="submit"]').attr('disabled',null);
    }
}

const minCheckboxes = (input) => {
    return $('input[name="'+ input.name +'"]:checked').length >= parseInt(input.dataset.min);
}

const maxCheckboxes = (input) => {
    console.log($('input[name="'+ input.name +'"]:checked').length <= input.dataset.max)
    return $('input[name="'+ input.name +'"]:checked').length <= parseInt(input.dataset.max);
}

const isValid = (validate,input) => {
    let valid = true,
    value = input.value;
    switch (validate) {
        case "name":
            valid = /^([^0-9]*)$/.test(value);
            break;
        case "email":
            valid = validator.isEmail(value);
            break;
        case "url":
            valid = validator.isURL(value,{protocols: ['http','https'],require_protocol: true}) || value === "http://" || value === "http:/";
            break;
        case "required":
            valid = !validator.isEmpty(value);
            break;
        case "password":
            valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]/.test(value);
            break;
        case "confirmPassword":
            valid = validator.equals(value, input.dataset.password);
            break;
        case "date":
            valid = validator.isBefore(value);
            break;
        case "minChecks":
            valid = minCheckboxes(input);
            break;
        case "maxChecks":
            valid = maxCheckboxes(input);
            break;
        case "minlength":
            valid = value.length >= parseInt(input.dataset.minlength)   
            break;
        case "maxlength":
            valid = value.length <= parseInt(input.dataset.maxlength)
            break;
    }
    return valid;
}

//validates one value at a time
const validate = (event) => {
    let input = event._isAMomentObject || !('validation' in event.target.dataset) ? {name: "bday", value: $('#bday').val(), dataset: {validation: "date,required" }} : event.target,
    validations = input.dataset.validation.split(','),
    parent = (input.name === "genres" || input.name === "themes") ? "ul" : "li",
    all_valid = true;

    //run all validations on input field
    validations.map(function(validation,index){
        //only validate if there is a value or required
        if(input.value.length || validation === "required"){
            all_valid = all_valid && isValid(validation,input)
        }
    });

    //if its valid, toggle error
    if(all_valid){
        $(input).closest(parent).removeClass('field-error');
        $(input).closest(parent).find('.help-text').hide();
    }else{
        $(input).closest(parent).addClass('field-error');
        $(input).closest(parent).find('.help-text').show();
    }
}

export { validate, formValid, isValid };
