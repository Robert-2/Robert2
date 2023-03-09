import Vue from 'vue';
import Sweetalert from 'sweetalert2/dist/sweetalert2';

export const confirm = async (options) => {
    const { translate: __ } = Vue.i18n;
    const {
        type = 'info',
        title = __('please-confirm'),
        confirmButtonText = __('confirm'),
        text,
    } = options;

    const { isConfirmed } = await Sweetalert.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        customClass: {
            confirmButton: `swal2-confirm--${type}`,
        },
        confirmButtonText,
        cancelButtonText: __('cancel'),
    });

    return isConfirmed;
};

export const prompt = (title, options = {}) => {
    const { translate: __ } = Vue.i18n;

    const {
        placeholder = '',
        confirmButtonText = __('save'),
        inputType = 'text',
        inputValue = '',
    } = options;

    return Sweetalert.fire({
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
