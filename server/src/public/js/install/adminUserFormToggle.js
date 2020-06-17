var adminFormSkip = document.getElementById('adminFormSkip');
var adminFormData = document.getElementById('adminFormData');

function showAdminFormData() {
    adminFormSkip.style.display = 'none';
    adminFormData.style.display = 'block';
};

function hideAdminFormData() {
    adminFormSkip.style.display = 'block';
    adminFormData.style.display = 'none';
};
