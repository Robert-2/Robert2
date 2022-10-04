import './index.scss';
import { defineComponent } from '@vue/composition-api';
import ClickOutside from 'vue-click-outside';

export const getItemClassnames = (isActive = false) => ({
    'Dropdown__item': true,
    'Dropdown__item--active': isActive,
});

// @vue/component
export default defineComponent({
    name: 'Dropdown',
    directives: { ClickOutside },
    props: {
        variant: { type: String, default: 'default' },
    },
    data() {
        return {
            isOpen: false,
        };
    },
    watch: {
        $route() {
            this.isOpen = false;
        },
    },
    methods: {
        handleToggle() {
            this.isOpen = !this.isOpen;
        },

        handleClose() {
            this.isOpen = false;
        },
    },
    render() {
        const { variant, isOpen, handleToggle, handleClose } = this;
        const { buttonText, title, items } = this.$scopedSlots;

        const classNames = ['Dropdown', {
            'Dropdown--open': isOpen,
            'Dropdown--actions': variant === 'actions',
        }];

        return (
            <div class={classNames} v-clickOutside={handleClose}>
                <div class="Dropdown__button" onClick={handleToggle}>
                    <span class="Dropdown__button__text">
                        {buttonText?.() || <i class="Dropdown__button__icon fas fa-ellipsis-h" />}
                    </span>
                    {buttonText && (
                        <i class={`Dropdown__button__chevron fas fa-chevron-${isOpen ? 'up' : 'down'}`} />
                    )}
                </div>
                <div class="Dropdown__menu">
                    {title && <h3 class="Dropdown__menu__title">{title()}</h3>}
                    <ul class="Dropdown__menu__items">{items?.()}</ul>
                </div>
            </div>
        );
    },
});
