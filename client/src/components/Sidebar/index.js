import './index.scss';
import Config from '@/globals/config';
import Logo from '@/components/Logo';
import Menu from './Menu';

// @vue/component
export default {
    name: 'Sidebar',
    props: {
        isOpen: Boolean,
    },
    data() {
        const year = (new Date()).getFullYear();
        const { version } = Config.api;
        return { year, version };
    },
    render() {
        const { isOpen, year, version } = this;

        return (
            <div class={['Sidebar', { 'Sidebar--opened': isOpen }]}>
                <div class="Sidebar__logo">
                    <Logo minimalist />
                </div>
                <Menu class="Sidebar__menu" />
                <div class="Sidebar__footer">
                    © 2017-{year}<br />
                    v. {version}
                </div>
            </div>
        );
    },
};
