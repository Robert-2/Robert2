import './index.scss';
import Config from '@/globals/config';
import Logo from '@/components/Logo/vue';
import useI18n from '@/hooks/vue/useI18n';

// @vue/component
const MinimalistLayout = (_, { slots }) => {
    const { version } = Config.api;
    const __ = useI18n();

    return () => {
        const children = slots.default?.();

        return (
            <div class="MinimalistLayout">
                <div class="MinimalistLayout__logo">
                    <Logo />
                </div>
                <div class="MinimalistLayout__body">
                    {children}
                </div>
                <div class="MinimalistLayout__footer">
                    {__('page-login.footer')}<br />
                    | <a href="http://robertmanager.org" target="_blank" rel="noreferrer">{__('page-login.official-website')}</a>{' '}
                    | <a href="http://forum.robertmanager.org" target="_blank" rel="noreferrer">{__('page-login.community-forum')}</a>{' '}
                    | <a href="https://github.com/robert-2/Robert2" target="_blank" rel="noreferrer">Github project</a>{' '}
                    | v{version}
                </div>
            </div>
        );
    };
};

export default MinimalistLayout;
