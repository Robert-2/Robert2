import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Item from './Item';

import type { PropType } from '@vue/composition-api';

export type Step = {
    id: number,
    name: string,
    filled: boolean,
    reachable?: boolean,
};

type Props = {
    /**
     * Un tableau contenant toutes les étapes de l'édition de réservation.
     *
     * Voir le type {@link Step} pour plus de détails sur le format des
     * objets attendus dans ce tableau.
     */
    steps: Step[],

    /** Le numéro de l'étape actuelle. */
    currentStep: Step['id'],
};

/** Une navigation multi-étapes. */
const Stepper = defineComponent({
    name: 'Stepper',
    props: {
        steps: {
            type: Array as PropType<Props['steps']>,
            required: true,
        },
        currentStep: {
            type: Number as PropType<Props['currentStep']>,
            required: true,
        },
    },
    emits: ['openStep'],
    methods: {
        openStep(id: Step['id']): void {
            const step = this.steps.find((_step: Step) => _step.id === id);
            if (step === undefined || step.reachable === false) {
                return;
            }
            this.$emit('openStep', step.id);
        },
    },
    render() {
        const { steps, openStep } = this;

        return (
            <div class="Stepper">
                {steps.map((step: Step) => (
                    <Item
                        key={step.id}
                        step={step}
                        active={step.id === this.currentStep}
                        onClick={() => { openStep(step.id); }}
                    />
                ))}
            </div>
        );
    },
});

export default Stepper;
