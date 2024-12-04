import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { Step } from '..';

type Props = {
    /** L'étape à afficher. */
    step: Step,

    /** L'étape est-elle l'étape active ? */
    active: boolean,
};

/** Une étape dans une navigation multi-étapes. */
const StepperItem = defineComponent({
    name: 'StepperItem',
    props: {
        step: {
            type: Object as PropType<Props['step']>,
            required: true,
        },
        active: {
            type: Boolean as PropType<Props['active']>,
            required: true,
        },
    },
    emits: ['click'],
    computed: {
        icon(): string {
            const { active, step: { filled } } = this;

            if (active) {
                return 'arrow-right';
            }

            if (filled) {
                return 'check';
            }

            return 'question';
        },
    },
    methods: {
        handleClick() {
            this.$emit('click');
        },
    },
    render() {
        const { id, name, filled, reachable = true } = this.step;
        const { icon, active, handleClick } = this;

        return (
            <div
                role="button"
                class={[
                    'StepperItem',
                    {
                        'StepperItem--active': active,
                        'StepperItem--reachable': reachable,
                        'StepperItem--validated': !active && filled,
                    },
                ]}
                onClick={handleClick}
            >
                <Icon class="StepperItem__icon" name={icon} />
                <span class="StepperItem__index">{id}</span>
                <span class="StepperItem__name">{name}</span>
            </div>
        );
    },
});

export default StepperItem;
