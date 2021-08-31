import './index.scss';

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
    render() {
        const { options, value } = this;

        if (options.length === 0) {
            return null;
        }

        return (
            <div class="MultiSwitch">
                {options.map(({ value: optionValue, label, isDisplayed = true }) => (
                    isDisplayed && (
                        <button
                            key={label}
                            type="button"
                            onClick={() => { this.$emit('change', optionValue); }}
                            class={{
                                'MultiSwitch__option': true,
                                'MultiSwitch__option--active': value === optionValue,
                            }}
                        >
                            {label}
                        </button>
                    )
                ))}
            </div>
        );
    },
};
