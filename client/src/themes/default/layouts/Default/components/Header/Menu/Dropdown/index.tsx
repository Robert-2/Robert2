import './index.scss';
import { defineComponent } from '@vue/composition-api';
import ClickOutside from 'vue-click-outside';
import Icon from '@/themes/default/components/Icon';
import Item from './Item';

import type { PropType } from '@vue/composition-api';
import type { Props as ItemProps } from './Item';

type Props = {
    /** Le libellé du dropdown. */
    label: string,

    /** Les actions à afficher dans le dropdown. */
    actions: ItemProps[],
};

type Data = {
    isOpen: boolean,
};

// @vue/component
const DefaultLayoutHeaderDropdown = defineComponent({
    name: 'DefaultLayoutHeaderDropdown',
    directives: { ClickOutside },
    props: {
        label: {
            type: String as PropType<Required<Props>['label']>,
            required: true,
        },
        actions: {
            type: Array as PropType<Required<Props>['actions']>,
            required: true,
        },
    },
    data: (): Data => ({
        isOpen: false,
    }),
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
        const {
            label,
            actions,
            isOpen,
            handleClose,
            handleToggle,
        } = this;

        const classNames = ['DefaultLayoutHeaderDropdown', {
            'DefaultLayoutHeaderDropdown--open': isOpen,
        }];

        return (
            <div class={classNames} v-clickOutside={handleClose}>
                <div class="DefaultLayoutHeaderDropdown__button" onClick={handleToggle}>
                    <span class="DefaultLayoutHeaderDropdown__button__text">{label}</span>
                    <Icon
                        name={`chevron-${isOpen ? 'up' : 'down'}`}
                        class="DefaultLayoutHeaderDropdown__button__chevron"
                    />
                </div>
                <ul class="DefaultLayoutHeaderDropdown__menu">
                    {actions.map((action: ItemProps, index: number) => (
                        <li key={index} class="DefaultLayoutHeaderDropdown__menu__item">
                            <Item
                                icon={action.icon}
                                label={action.label}
                                to={action.to}
                                external={action.external}
                                onClick={action.onClick ?? (() => {})}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        );
    },
});

export default DefaultLayoutHeaderDropdown;
