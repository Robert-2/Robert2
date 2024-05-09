import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon, { Variant } from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { Props as IconProps } from '@/themes/default/components/Icon';

export type OptionData = {
    value: string | number,
    label: string,
    icon?: string | `${string}:${Required<IconProps>['variant']}`,
    isDisplayed?: boolean,
};

type Props = {
    /** Les données de l'option. */
    data: OptionData,

    /** L'option est-elle celle qui est active ? */
    active: boolean,
};

/** Une option pour le MultiSwitch. */
const MultiSwitchOption = defineComponent({
    name: 'MultiSwitchOption',
    props: {
        data: {
            type: Object as PropType<Props['data']>,
            required: true,
        },
        active: {
            type: Boolean as PropType<Required<Props>['active']>,
            default: true,
        },
    },
    emits: ['select'],
    computed: {
        normalizedIcon(): IconProps | null {
            const { icon } = this.data;

            if (!icon) {
                return null;
            }

            if (!icon.includes(':')) {
                return { name: icon };
            }

            const [name, variant] = icon.split(':');
            if (Object.values(Variant).includes(variant as Variant)) {
                return { name, variant: variant as Variant };
            }

            return { name };
        },
    },
    methods: {
        handleClick() {
            if (this.active) {
                return;
            }

            this.$emit('select', this.data.value);
        },
    },
    render() {
        const { data, normalizedIcon: icon, active, handleClick } = this;

        const classNames = ['MultiSwitchOption', {
            'MultiSwitchOption--active': active,
        }];

        return (
            <label for={`multiSwitchValue-${data.value}`} class={classNames}>
                <input
                    type="radio"
                    id={`multiSwitchValue-${data.value}`}
                    class="MultiSwitchOption__input"
                    checked={active}
                    onClick={handleClick}
                />
                {!!icon && <Icon {...{ props: icon } as any} class="MultiSwitchOption__icon" />}
                {data.label}
            </label>
        );
    },
});

export default MultiSwitchOption;
