import './index.scss';
import clsx from 'clsx';
import { defineComponent } from '@vue/composition-api';
import Loading from '@/themes/default/components/Loading';

import type { VNode } from 'vue';
import type { PropType } from '@vue/composition-api';

export type Props = {
    /** Le nom unique de la page. */
    name: string,

    /**
     * L'éventuel titre de la page.
     *
     * Celui-ci sera utilisé dans le header de l'application
     * ainsi que dans le `<title></title>` du document.
     */
    title?: string,

    /** Un éventuel message d'aide global à la page. */
    help?: string,

    /**
     * La page contient t'elle actuellement des erreurs de validation ?
     *
     * Ceci permettra d'afficher une alerte spécifique en haut de la page.
     * (à la place du message d'aide s'il a été spécifié (see {@link Props['help']}))
     */
    hasValidationError?: boolean,

    /**
     * La page est-elle en cours de chargement ?
     *
     * Ceci permettra d'afficher un message de chargement spécifique en haut de la page.
     * (à la place du message d'aide s'il a été spécifié (see {@link Props['help']}))
     */
    loading?: boolean,

    /** Permet de centrer le contenu de la page. */
    centered?: boolean,

    /**
     * Les éventuelles actions contextuelles de la page.
     * (sous forme de nœuds vue dans un tableau)
     */
    actions?: VNode[],
};

/** Une page. */
const Page = defineComponent({
    name: 'Page',
    props: {
        name: {
            type: String as PropType<Props['name']>,
            required: true,
        },
        title: {
            type: String as PropType<Props['title']>,
            default: undefined,
        },
        help: {
            type: String as PropType<Props['help']>,
            default: undefined,
        },
        hasValidationError: {
            type: Boolean as PropType<Required<Props>['hasValidationError']>,
            default: false,
        },
        loading: {
            type: Boolean as PropType<Required<Props>['loading']>,
            default: false,
        },
        centered: {
            type: Boolean as PropType<Required<Props>['centered']>,
            default: false,
        },
        actions: {
            type: Array as PropType<Props['actions']>,
            default: undefined,
        },
    },
    watch: {
        title(newTitle: Props['title']) {
            this.updateTitle(newTitle);
        },
    },
    mounted() {
        this.updateTitle(this.title);
    },
    beforeDestroy() {
        this.updateTitle(undefined);
    },
    methods: {
        updateTitle(newTitle: Props['title']) {
            this.$store.commit('setPageRawTitle', newTitle ?? null);
            document.title = [newTitle, 'Loxya'].filter(Boolean).join(' - ');
        },

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        /**
         * Permet de faire défiler le document jusqu'en haut de la page.
         *
         * @param behavior - Détermine la manière d'atteindre le haut de la page:
         *                   - `smooth`: La "montée" sera progressive, avec animation (défaut).
         *                   - `instant`: La montée sera instantanée.
         *                   - `auto`: L'animation de montée sera déterminée via la
         *                             propriété CSS `scroll-behavior`.
         */
        scrollToTop(behavior: ScrollBehavior = 'smooth') {
            const $container = this.$refs.container as HTMLElement | undefined;
            $container?.scrollTo({ top: 0, left: 0, behavior });
        },
    },
    render() {
        const children = this.$slots.default;
        const {
            $t: __,
            name,
            help,
            actions,
            centered,
            loading,
            hasValidationError,
        } = this;

        const renderHelp = (): JSX.Element | null => {
            if (!loading && !hasValidationError && !help) {
                return null;
            }

            const renderHelpContent = (): JSX.Element => {
                if (loading) {
                    return <Loading horizontal />;
                }

                return (
                    <p
                        class={[
                            'Page__header__help__message',
                            { 'Page__header__help__message--error': hasValidationError },
                        ]}
                    >
                        {hasValidationError ? __('errors.validation') : help}
                    </p>
                );
            };
            return <div class="Page__header__help">{renderHelpContent()}</div>;
        };

        const renderHeader = (): JSX.Element | null => {
            const hasActions = actions && actions.length > 0;
            const helpElement = renderHelp();
            if (helpElement === null && !hasActions) {
                return null;
            }

            return (
                <div class="Page__header">
                    {helpElement}
                    {hasActions && (
                        <nav class="Page__header__actions" key="header-actions">
                            {actions}
                        </nav>
                    )}
                </div>
            );
        };

        const className = clsx('Page', `Page--${name}`, {
            'Page--centered': centered,
        });

        return (
            <div class={className} ref="container">
                {renderHeader()}
                <div class="Page__body" key="body">
                    {children}
                </div>
            </div>
        );
    },
});

export default Page;
