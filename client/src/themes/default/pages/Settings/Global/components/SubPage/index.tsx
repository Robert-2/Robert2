import './index.scss';
import { defineComponent } from '@vue/composition-api';
import ErrorMessage from '@/themes/default/components/ErrorMessage';

import type { PropType } from '@vue/composition-api';

type Props = {
    /** Le titre de la sous-page. */
    title: string,

    /** Une éventuelle "aide" / un sous-titre pour la sous-page. */
    help?: string,

    /**
     * La page contient t'elle actuellement des erreurs de validation ?
     *
     * Ceci permettra d'afficher une alerte spécifique en haut de la page.
     */
    hasValidationError?: boolean,
};

/** Sous-page des paramètres globaux. */
const GlobalSettingsSubPage = defineComponent({
    name: 'GlobalSettingsSubPage',
    props: {
        title: {
            type: String as PropType<Props['title']>,
            required: true,
        },
        help: {
            type: String as PropType<Props['help']>,
            default: undefined,
        },
        hasValidationError: {
            type: Boolean as PropType<Required<Props>['hasValidationError']>,
            default: false,
        },
    },
    render() {
        const children = this.$slots.default;
        const { $t: __, title, help, hasValidationError } = this;

        return (
            <div class="GlobalSettingsSubPage">
                <header class="GlobalSettingsSubPage__header">
                    <h2 class="GlobalSettingsSubPage__title">{title}</h2>
                    {!!help && <span class="GlobalSettingsSubPage__sub-title">{help}</span>}
                </header>
                {hasValidationError && (
                    <ErrorMessage error={__('errors.validation')} />
                )}
                <div class="GlobalSettingsSubPage__content">
                    {children}
                </div>
            </div>
        );
    },
});

export default GlobalSettingsSubPage;
