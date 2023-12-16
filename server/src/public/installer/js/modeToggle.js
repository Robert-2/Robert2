const $degressiveRateField = document.querySelector('#degressiveRateField');

function handleBillingModeChange($input) {
    const display = $input.value === 'none' ? 'none' : 'block';
    $degressiveRateField.style.display = display;
}
