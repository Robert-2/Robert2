import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Option from './Option';

import type { PropType } from '@vue/composition-api';
import type { OptionData } from './Option';

type Props = {
    /** La liste des options à afficher. */
    options: OptionData[],

    /** La valeur de l'option sélectionnée. */
    value: string | number | null,
};

/**
 * Affiche plusieurs boutons côte-à-côte.
 * Une seule option peut être sélectionné à la fois.
 */
const MultiSwitch = defineComponent({
    name: 'MultiSwitch',
    props: {
        options: {
            type: Array as PropType<Props['options']>,
            required: true,
        },
        value: {
            type: [String, Number] as PropType<Props['value']>,
            required: true,
            validator: (value: unknown) => (
                ['string', 'number'].includes(typeof value) ||
                value === null
            ),
        },
    },
    emits: ['change'],
    computed: {
        displayedOptions(): OptionData[] {
            return this.options.filter(({ isDisplayed = true }: OptionData) => isDisplayed);
        },
    },
    methods: {
        handleSelect(selectedValue: string | number) {
            this.$emit('change', selectedValue);
        },
    },
    render() {
        const { displayedOptions, value, handleSelect } = this;

        if (displayedOptions.length === 0) {
            return null;
        }

        return (
            <div class="MultiSwitch">
                {displayedOptions.map((option: OptionData) => (
                    <Option
                        key={option.value}
                        data={option}
                        active={value === option.value}
                        onSelect={handleSelect}
                    />
                ))}
            </div>
        );
    },
});

export default MultiSwitch;
