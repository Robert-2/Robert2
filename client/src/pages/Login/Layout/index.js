import './index.scss';
import Config from '@/globals/config';
import Logo from '@/components/Logo/vue';

// @vue/component
export default {
    name: 'LoginLayout',
    data() {
        return {
            apiVersion: Config.api.version,
        };
    },
    render() {
        const { $t: __, apiVersion } = this;

        return (
            <div class="LoginLayout">
                <div class="LoginLayout__logo">
                    <Logo />
                </div>
                <div class="LoginLayout__body">
                    {this.$slots.default}
                </div>
                <div class="LoginLayout__footer">
                    {__('page-login.footer')}<br />
                    | <a href="http://robertmanager.org" target="_blank" rel="noreferrer">{__('page-login.official-website')}</a>{' '}
                    | <a href="http://forum.robertmanager.org" target="_blank" rel="noreferrer">{__('page-login.community-forum')}</a>{' '}
                    | <a href="https://github.com/robert-2/Robert2" target="_blank" rel="noreferrer">Github project</a>{' '}
                    | v{apiVersion}
                </div>
            </div>
        );
    },
};
