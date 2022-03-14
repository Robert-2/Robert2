import './index.scss';
import Logo from '@/components/Logo/vue';
import Menu from './Menu';

// @vue/component
export default {
    name: 'DefaultLayoutHeader',
    computed: {
        pageTitle() {
            const { pageTitle, pageSubTitle = '', pageRawTitle } = this.$store.state;

            if (pageRawTitle !== null) {
                return pageRawTitle;
            }

            return this.$t(pageTitle, { pageSubTitle });
        },
    },
    watch: {
        pageTitle() {
            this.$emit('toggleMenu', false);
        },
    },
    methods: {
        toggleMenu() {
            this.$emit('toggleMenu', 'toggle');
        },
    },
    render() {
        const { pageTitle, toggleMenu } = this;

        return (
            <div class="DefaultLayoutHeader">
                <div class="DefaultLayoutHeader__logo">
                    <Logo minimalist />
                </div>
                <div class="DefaultLayoutHeader__menu-toggle" onClick={toggleMenu}>
                    <i class="fas fa-bars fa-2x" />
                </div>
                <div class="DefaultLayoutHeader__title">{pageTitle}</div>
                <Menu class="DefaultLayoutHeader__menu" />
            </div>
        );
    },
};
