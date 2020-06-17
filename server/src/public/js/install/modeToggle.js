var degressiveRateField = document.getElementById('degressiveRateField');

function handleBillingModeChange(input) {
    var display = input.value === 'none' ? 'none' : 'block';
    degressiveRateField.style.display = display;
}
