import Vue from 'vue';
import Swal from 'sweetalert2/dist/sweetalert2';

export const confirm = ({ title, text, confirmButtonText, type = 'info' }) => {
    const { translate: __ } = Vue.i18n;

    return Swal.fire({
        icon: 'warning',
        title: title ?? __('please-confirm'),
        text,
        showCancelButton: true,
        customClass: {
            confirmButton: `swal2-confirm--${type}`,
        },
        confirmButtonText,
        cancelButtonText: __('cancel'),
    });
};

export const prompt = (title, options = {}) => {
    const { translate: __ } = Vue.i18n;

    const {
        placeholder = '',
        confirmButtonText = __('save'),
        inputType = 'text',
        inputValue = '',
    } = options;

    return Swal.fire({
        title,
        input: inputType,
        inputPlaceholder: placeholder,
        inputValue,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: __('cancel'),
        customClass: {
            confirmButton: 'swal2-confirm--success',
        },
    });
};
