import './index.scss';
import Logo from '@/components/Logo';
import TopMenu from './TopMenu';

// @vue/component
export default {
    name: 'MainHeader',
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
            <div class="MainHeader">
                <div class="MainHeader__logo">
                    <Logo minimalist />
                </div>
                <div class="MainHeader__menu-toggle" onClick={toggleMenu}>
                    <i class="fas fa-bars fa-2x" />
                </div>
                <div class="MainHeader__title">{pageTitle}</div>
                <TopMenu class="MainHeader__menu" />
            </div>
        );
    },
};
