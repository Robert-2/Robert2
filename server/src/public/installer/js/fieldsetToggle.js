const $hiddenFieldset = document.querySelector('.form__fieldset--hidden');
const $showFieldset = document.querySelector('#show-fieldset');

function showHiddenFieldset() {
    $hiddenFieldset.style.display = 'block';
    $showFieldset.style.display = 'none';
};

function hideHiddenFieldset() {
    $hiddenFieldset.style.display = 'none';
    $showFieldset.style.display = 'inline-block';
};
