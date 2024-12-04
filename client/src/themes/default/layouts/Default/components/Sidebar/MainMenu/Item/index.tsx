import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import Icon from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { CustomRouterLinkProps, Location } from 'vue-router';

export type MenuLinkItem = {
    ident: string,
    icon: string,
    to?: string | Location,
    onClick?(): void,
    external?: boolean,
    exact?: boolean,
    counter?: number,
};

type Props = {
    /** Le nom du lien, utilisé comme clé de traduction. */
    ident: string,

    /**
     * La cible du lien sous forme de chaîne ou d'objet `Location` compatible avec Vue-Router.
     *
     * Si non définie, un élément HTML `<button>` sera utilisé et
     * vous devriez écouter l'événement `onClick` pour réagir au click.
     */
    to?: string | Location,

    /** L'icône à afficher. */
    icon: string,

    /**
     * Permet d'indiquer que c'est un lien externe.
     *
     * Si c'est le cas, le component fonctionnera comme suit:
     * - Le routing interne ("Vue Router"), ne sera pas utilisé.
     *   (Il ne faut donc pas passer d'objet à `to` mais bien une chaîne)
     * - Si c'est une URL absolue, celle-ci s'ouvrira dans une autre fenêtre / onglet.
     */
    external?: boolean,

    /** Un nombre à afficher dans une pastille sur le lien. */
    counter?: number,

    /**
     * Si la valeur vaut `true`, le router considérera
     * l'URL comme exacte lors du check du lien actif.
     */
    exact?: boolean,
};

/** Item du menu principal de la barre latérale. */
const DefaultLayoutSidebarMainMenuItem = defineComponent({
    name: 'DefaultLayoutSidebarMainMenuItem',
    props: {
        ident: {
            type: String as PropType<Required<Props>['ident']>,
            required: true,
        },
        to: {
            type: [String, Object] as PropType<Props['to']>,
            default: undefined,
        },
        icon: {
            type: String as PropType<Required<Props>['icon']>,
            required: true,
        },
        external: {
            type: Boolean as PropType<Required<Props>['external']>,
            default: false,
        },
        counter: {
            type: Number as PropType<Props['counter']>,
            default: undefined,
        },
        exact: {
            type: Boolean as PropType<Required<Props>['exact']>,
            default: false,
        },
    },
    emits: ['click'],
    methods: {
        handleClick(event: MouseEvent) {
            this.$emit('click', event);
        },
    },
    render() {
        const { $t: __, ident, to, handleClick, external, icon, counter, exact } = this;

        const content = (
            <Fragment>
                <span class="DefaultLayoutSidebarMainMenuItem__icon">
                    <Icon
                        name={icon}
                        class="DefaultLayoutSidebarMainMenuItem__icon__content"
                    />
                    {!!counter && (
                        <span class="DefaultLayoutSidebarMainMenuItem__icon__counter">
                            {counter}
                        </span>
                    )}
                </span>
                <span class="DefaultLayoutSidebarMainMenuItem__text">
                    {__(`layout.default.menu.${ident}`)}
                </span>
            </Fragment>
        );

        if (to) {
            if (external) {
                const isOutside = typeof to === 'string' && to.includes('://');

                return (
                    <li class="DefaultLayoutSidebarMainMenuItem">
                        <a
                            href={to}
                            target={isOutside ? '_blank' : undefined}
                            rel={isOutside ? 'noreferrer noopener' : undefined}
                            class="DefaultLayoutSidebarMainMenuItem__link"
                        >
                            {content}
                        </a>
                    </li>
                );
            }

            return (
                <router-link to={to} exact={exact} custom>
                    {({ href, navigate, isActive }: CustomRouterLinkProps) => (
                        <li
                            class={[
                                'DefaultLayoutSidebarMainMenuItem',
                                { 'DefaultLayoutSidebarMainMenuItem--active': isActive },
                            ]}
                        >
                            <a
                                href={href}
                                onClick={navigate}
                                class="DefaultLayoutSidebarMainMenuItem__link"
                            >
                                {content}
                            </a>
                        </li>
                    )}
                </router-link>
            );
        }

        return (
            <li class="DefaultLayoutSidebarMainMenuItem">
                <button
                    type="button"
                    class="DefaultLayoutSidebarMainMenuItem__link"
                    onClick={handleClick}
                >
                    {content}
                </button>
            </li>
        );
    },
});

export default DefaultLayoutSidebarMainMenuItem;
