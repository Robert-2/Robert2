var categsInput = document.getElementsByClassName('form__input-categories')[0];
var categsCounter = document.getElementsByClassName('categs-count')[0];
var submitButton = document.getElementsByClassName('form__submit-button')[0];

function onInputKeyUp() {
    var values = categsInput.value.split(',');
    var categs = values.filter(function(categ) {
        return categ.trim().length >= 2;
    });
    var count = categs.length;

    submitButton.disabled = count === 0;

    categsCounter.textContent = count.toString();
}

onInputKeyUp();
