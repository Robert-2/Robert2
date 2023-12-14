import './index.scss';
import { defineComponent } from '@vue/composition-api';
import config from '@/globals/config';
import Logo from '@/themes/default/components/Logo';

/**
 * Variante minimaliste du template de l'application.
 */
const MinimalistLayout = defineComponent({
    name: 'MinimalistLayout',
    computed: {
        version(): string {
            const { version } = config.api;
            return version;
        },
    },
    render() {
        const { $t: __, version } = this;
        const children = this.$slots.default;

        return (
            <div class="MinimalistLayout">
                <div class="MinimalistLayout__body">
                    <div class="MinimalistLayout__logo">
                        <Logo />
                    </div>
                    <div class="MinimalistLayout__content">
                        {children}
                    </div>
                </div>
                <div class="MinimalistLayout__footer">
                    {__('layout.minimalist.footer-text')}<br />
                    | <a href="https://robertmanager.org" target="_blank" rel="noreferrer">{__('external-links.official-website')}</a>{' '}
                    | <a href="https://forum.robertmanager.org" target="_blank" rel="noreferrer">{__('external-links.community-forum')}</a>{' '}
                    | <a href="https://github.com/robert-2/Robert2" target="_blank" rel="noreferrer">{__('external-links.github-repository')}</a>{' '}
                    | v{version}
                </div>
            </div>
        );
    },
});

export default MinimalistLayout;
