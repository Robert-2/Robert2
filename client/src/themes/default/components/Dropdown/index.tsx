import './index.scss';
import { defineComponent } from '@vue/composition-api';
import ClickOutside from 'vue-click-outside';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';

type Props = {
    /**
     * Le libellé qui sera utilisé dans le bouton dépliant.
     * Si non spécifié, une icône "trois points" sera utilisée.
     */
    label?: string,
};

type Data = {
    isOpen: boolean,
};

// @vue/component
const Dropdown = defineComponent({
    name: 'Dropdown',
    directives: { ClickOutside },
    props: {
        label: {
            type: String as PropType<Props['label']>,
            default: undefined,
        },
    },
    data: (): Data => ({
        isOpen: false,
    }),
    methods: {
        handleToggle() {
            this.isOpen = !this.isOpen;
        },

        handleClickOutside() {
            this.isOpen = false;
        },

        handleClickDropdown() {
            this.isOpen = false;
        },
    },
    render() {
        const children = this.$slots.default;
        const {
            label,
            isOpen,
            handleToggle,
            handleClickOutside,
            handleClickDropdown,
        } = this;

        const classNames = ['Dropdown', {
            'Dropdown--open': isOpen,
        }];

        return (
            <div class={classNames} v-clickOutside={handleClickOutside}>
                <Button
                    onClick={handleToggle}
                    icon={(
                        undefined !== label
                            ? { position: 'after', name: `chevron-${isOpen ? 'up' : 'down'}` }
                            : 'ellipsis-h'
                    )}
                >
                    {label}
                </Button>
                <div class="Dropdown__menu" onClick={handleClickDropdown}>
                    {children}
                </div>
            </div>
        );
    },
});

export default Dropdown;
