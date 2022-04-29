import './index.scss';
import Option from './Option';

// @vue/component
export default {
    name: 'MultiSwitch',
    props: {
        options: { type: Array, required: true },
        value: {
            required: true,
            validator: (value) => (
                ['string', 'number'].includes(typeof value) ||
                value === null
            ),
        },
    },
    methods: {
        handleSelect(selectedValue) {
            this.$emit('change', selectedValue);
        },
    },
    render() {
        const { options, value, handleSelect } = this;

        if (options.length === 0) {
            return null;
        }

        return (
            <div class="MultiSwitch">
                {options.map(({ value: optionValue, label, isDisplayed = true }) => (
                    isDisplayed && (
                        <Option
                            value={optionValue}
                            label={label}
                            active={value === optionValue}
                            onSelect={handleSelect}
                        />
                    )
                ))}
            </div>
        );
    },
};
