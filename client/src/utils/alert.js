import Vue from 'vue';
import createDeferred from 'p-defer';
import Sweetalert from 'sweetalert2/dist/sweetalert2';

/**
 * Wrap l'appel à SweetAlert en ne résolvant la promesse de retour que
 * quand SweetAlert a vraiment terminé son processing et a disparu de l'interface.
 *
 * Sans ça, le résultat est renvoyé avant le `didDestroy` de SweetAlert et lors
 * de celui-ci, SweetAlert change l'élément de la page qui a le focus (via un genre de `blur`)
 * et provoque des soucis pour le reste de l'application (qui voit son focus "sauter" ailleurs après coup).
 *
 * @param {SweetAlertOptions} options - Les options passés à SweetAlert.
 *
 * @returns {Promise<SweetAlertResult>} Une promesse contenant le résultat retourné par SweetAlert.
 */
const wrapSweetAlert = (options) => (
    new Promise((resolve) => {
        const destroyDeferred = createDeferred();
        const resultPromise = Sweetalert.fire({
            ...options,
            didDestroy() {
                destroyDeferred.resolve();
            },
        });

        Promise.all([resultPromise, destroyDeferred.promise]).then(
            ([result]) => { resolve(result); },
        );
    })
);

export const confirm = async (options) => {
    const { translate: __ } = Vue.i18n;

    if (typeof options === 'string') {
        options = { text: options };
    }

    const {
        type = 'info',
        title = __('please-confirm'),
        confirmButtonText = __('confirm'),
        text,
    } = options;

    const { isConfirmed } = await wrapSweetAlert({
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

    return wrapSweetAlert({
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
