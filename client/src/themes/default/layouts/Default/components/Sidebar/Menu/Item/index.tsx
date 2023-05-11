import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { CustomRouterLinkProps } from 'vue-router';

type Props = {
    /** Le nom du lien, utilisé comme clé de traduction. */
    ident: string,

    /** L'URL du lien. */
    url: string,

    /** L'icône à affiher. */
    icon: string,

    /** Un nombre à afficher dans une pastille sur le lien. */
    counter?: number,

    /**
     * Si la valeur vaut `true`, le router considèrera
     * l'URL comme exacte lors du check du lien actif.
     */
    exact?: boolean,
};

const DefaultLayoutSidebarMenuItem = defineComponent({
    props: {
        ident: {
            type: String as PropType<Required<Props>['ident']>,
            required: true,
        },
        url: {
            type: String as PropType<Required<Props>['url']>,
            required: true,
        },
        icon: {
            type: String as PropType<Required<Props>['icon']>,
            required: true,
        },
        counter: {
            type: Number as PropType<Required<Props>['counter']>,
            default: null,
        },
        exact: {
            type: Boolean as PropType<Required<Props>['exact']>,
            default: false,
        },
    },
    render() {
        const { $t: __, ident, url, icon, counter, exact } = this;

        return (
            <router-link to={url} exact={exact} custom>
                {({ href, navigate, isActive }: CustomRouterLinkProps) => (
                    <li
                        class={[
                            'DefaultLayoutSidebarMenuItem',
                            { 'DefaultLayoutSidebarMenuItem--active': isActive },
                        ]}
                    >
                        {!!counter && (
                            <span class="DefaultLayoutSidebarMenuItem__counter">
                                {counter}
                            </span>
                        )}
                        <a href={href} onClick={navigate} class="DefaultLayoutSidebarMenuItem__link">
                            <Icon name={icon} class="DefaultLayoutSidebarMenuItem__icon" />
                            <span class="DefaultLayoutSidebarMenuItem__title">
                                {__(`layout.default.menu.${ident}`)}
                            </span>
                        </a>
                    </li>
                )}
            </router-link>
        );
    },
});

export default DefaultLayoutSidebarMenuItem;
