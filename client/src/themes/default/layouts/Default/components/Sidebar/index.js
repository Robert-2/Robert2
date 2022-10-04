import './index.scss';
import config from '@/globals/config';
import Logo from '@/themes/default/components/Logo/vue';
import Menu from './Menu';

// @vue/component
export default {
    name: 'DefaultLayoutSidebar',
    props: {
        isOpen: Boolean,
    },
    data() {
        const year = (new Date()).getFullYear();
        const { version } = config.api;
        return { year, version };
    },
    render() {
        const { isOpen, year, version } = this;

        return (
            <div class={['DefaultLayoutSidebar', { 'DefaultLayoutSidebar--opened': isOpen }]}>
                <div class="DefaultLayoutSidebar__logo">
                    <Logo minimalist />
                </div>
                <Menu class="DefaultLayoutSidebar__menu" />
                <div class="DefaultLayoutSidebar__footer">
                    © 2017-{year}<br />
                    v. {version}
                </div>
            </div>
        );
    },
};
