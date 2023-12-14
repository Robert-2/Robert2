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
 * @param {import('sweetalert2').SweetAlertOptions} options - Les options passés à SweetAlert.
 *
 * @returns {Promise<import('sweetalert2').SweetAlertResult>} Une promesse contenant le résultat retourné par SweetAlert.
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

/**
 * Permet de créer un nouveau type d'alerte.
 *
 * @param {import('sweetalert2').SweetAlertIcon} icon - L'icône à utiliser.
 * @param {string} title - Le titre de l'alerte.
 * @param {string} message - Le corps de l'alerte.
 * @param {boolean|number} autoClose - Permet de fermer automatiquement l'alerte.
 *                                     Deux valeurs sont possibles:
 *                                     - Un booléen, auquel cas ceci activera / désactivera la
 *                                       fonctionnalité (avec un timer de 20s par défaut)
 *                                     - Un nombre, en millisecondes, permettant de customiser le
 *                                       délai avant fermeture automatique.
 */
const wrapAlert = (icon, title, message, autoClose) => {
    const { translate: __ } = Vue.i18n;

    if (typeof autoClose === 'boolean') {
        autoClose = autoClose === true ? 20_000 : undefined;
    }

    wrapSweetAlert({
        icon,
        titleText: title,
        text: message,
        timer: autoClose,
        timerProgressBar: true,
        confirmButtonText: __('close'),
    });
};

/**
 * Affiche une alerte de type "error".
 *
 * @param {string} title - Le titre de l'alerte.
 * @param {string} message - Le corps de l'alerte.
 * @param {boolean|number} autoClose - Permet de fermer automatiquement l'alerte.
 *                                     Deux valeurs sont possibles:
 *                                     - Un booléen, auquel cas ceci activera / désactivera la
 *                                       fonctionnalité (avec un timer de 5s par défaut)
 *                                     - Un nombre, en millisecondes, permettant de customiser le
 *                                       délai avant fermeture automatique.
 */
export const error = (title, message, autoClose = false) => {
    wrapAlert('error', title, message, autoClose);
};

/**
 * Affiche une alerte de type "warning".
 *
 * @param {string} title - Le titre de l'alerte.
 * @param {string} message - Le corps de l'alerte.
 * @param {boolean|number} autoClose - Permet de fermer automatiquement l'alerte.
 *                                     Deux valeurs sont possibles:
 *                                     - Un booléen, auquel cas ceci activera / désactivera la
 *                                       fonctionnalité (avec un timer de 5s par défaut)
 *                                     - Un nombre, en millisecondes, permettant de customiser le
 *                                       délai avant fermeture automatique.
 */
export const warning = (title, message, autoClose = false) => {
    wrapAlert('warning', title, message, autoClose);
};

/**
 * Affiche une alerte de type "info".
 *
 * @param {string} title - Le titre de l'alerte.
 * @param {string} message - Le corps de l'alerte.
 * @param {boolean|number} autoClose - Permet de fermer automatiquement l'alerte.
 *                                     Deux valeurs sont possibles:
 *                                     - Un booléen, auquel cas ceci activera / désactivera la
 *                                       fonctionnalité (avec un timer de 5s par défaut)
 *                                     - Un nombre, en millisecondes, permettant de customiser le
 *                                       délai avant fermeture automatique.
 */
export const info = (title, message, autoClose = false) => {
    wrapAlert('info', title, message, autoClose);
};

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
