import './index.scss';
import { mapState } from 'vuex';
import { defineComponent } from '@vue/composition-api';
import Logo from '@/themes/default/components/Logo';
import Icon from '@/themes/default/components/Icon';
import Menu from './Menu';

// @vue/component
const DefaultLayoutHeader = defineComponent({
    name: 'DefaultLayoutHeader',
    emits: ['toggleMenu'],
    computed: {
        ...mapState({ pageTitle: 'pageRawTitle' }),
    },
    watch: {
        $route() {
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
                    <Icon name="bars" />
                </div>
                <div class="DefaultLayoutHeader__title">{pageTitle}</div>
                <Menu class="DefaultLayoutHeader__menu" />
            </div>
        );
    },
});

export default DefaultLayoutHeader;
