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
            return config.version;
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
                    <a
                        class="MinimalistLayout__footer__link"
                        href="https://robertmanager.org"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {__('external-links.official-website')}
                    </a>
                    {' '}|{' '}
                    <a
                        class="MinimalistLayout__footer__link"
                        href="https://forum.robertmanager.org"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {__('external-links.community-forum')}
                    </a>
                    {' '}|{' '}
                    v{version}
                </div>
            </div>
        );
    },
});

export default MinimalistLayout;
