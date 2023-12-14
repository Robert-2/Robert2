import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';
import pages from '../../pages';

import type { CustomRouterLinkProps } from 'vue-router';
import type { Page } from '../../pages';

/** Sidebar de la page des paramètres globaux. */
const GlobalSettingsSidebar = defineComponent({
    name: 'GlobalSettingsSidebar',
    render() {
        const { $t: __ } = this;

        return (
            <ul class="GlobalSettingsSidebar">
                {pages.map(({ name, meta }: Page, index: number) => (
                    <router-link key={index} to={{ name }} exact custom>
                        {({ href, navigate, isActive }: CustomRouterLinkProps) => (
                            <li
                                class={[
                                    'GlobalSettingsSidebar__item',
                                    { 'GlobalSettingsSidebar__item--active': isActive },
                                ]}
                            >
                                <a href={href} onClick={navigate} class="GlobalSettingsSidebar__item__link">
                                    <Icon name={meta.icon} class="GlobalSettingsSidebar__item__icon" />
                                    <span class="GlobalSettingsSidebar__item__title">{__(meta.title)}</span>
                                </a>
                            </li>
                        )}
                    </router-link>
                ))}
            </ul>
        );
    },
});

export default GlobalSettingsSidebar;
