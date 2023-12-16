const $categoriesInput = document.querySelector('.form__input-categories');
const $categoriesCounter = document.querySelector('.categories-count');
const $submitButton = document.querySelector('.form__submit-button');

const onInputKeyUp = () => {
    const values = $categoriesInput.value.split(',');
    const categories = values.filter((category) => (
        category.trim().length >= 2
    ));
    const count = categories.length;

    $submitButton.disabled = count === 0;
    $categoriesCounter.textContent = count.toString();
};

onInputKeyUp();
