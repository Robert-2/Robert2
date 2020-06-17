var hiddenFieldset = document.getElementsByClassName('form__fieldset--hidden')[0];
var showFieldset = document.getElementById('showFieldset');

function showHiddenFieldset() {
    hiddenFieldset.style.display = 'block';
    showFieldset.style.display = 'none';
};

function hideHiddenFieldset() {
    hiddenFieldset.style.display = 'none';
    showFieldset.style.display = 'inline-block';
};
