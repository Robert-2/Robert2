import omit from 'lodash/omit';

const MODAL_EVENTS_MAP = {
    onOpen: 'before-open',
    onOpened: 'opened',
    onClose: 'before-close',
    onClosed: 'closed',
};

const showModal = ($modal, component, props = {}) => {
    const { clickToClose = true, ...otherOptions } = component.modal ?? {};

    return new Promise((resolve) => {
        const originalOnClose = props.onClose;
        props = {
            ...props,
            onClose: (event) => {
                originalOnClose?.(event);
                resolve(event.params);
            },
        };

        $modal.show(
            component,
            omit(props, Object.keys(MODAL_EVENTS_MAP)),
            {
                ...otherOptions,

                // NOTE: Sur les périphériques touch, avec vue-modal 2.0.0-rc.6, il y
                //       a un bug avec l'ouverture des modales si l'option `clickToClose`
                //       n'est pas désactivée, le double-tap doit provoquer la fermeture
                //       immédiate de la modale.
                clickToClose: !clickToClose ? false : !(
                    'ontouchstart' in window ||
                    navigator.maxTouchPoints > 0 ||
                    navigator.msMaxTouchPoints > 0
                ),
            },
            Object.entries(MODAL_EVENTS_MAP).reduce(
                (result, [eventName, originalEventName]) => {
                    if (eventName in props) {
                        result[originalEventName] = props[eventName];
                    }
                    return result;
                },
                {},
            ),
        );
    });
};

export default showModal;
