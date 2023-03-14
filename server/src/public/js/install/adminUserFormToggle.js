const $adminFormSkip = document.querySelector('#admin-form-skip');
const $adminFormData = document.querySelector('#admin-form-data');

function showAdminFormData() {
    $adminFormSkip.style.display = 'none';
    $adminFormData.style.display = 'block';
};

function hideAdminFormData() {
    $adminFormSkip.style.display = 'block';
    $adminFormData.style.display = 'none';
};
