import './index.scss';

// @vue/component
const MultiSwitch = {
    name: 'MultiSwitch',
    props: {
        options: Array,
        value: String,
    },
    render() {
        const { options, value } = this;

        if (!options || options.length === 0) {
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

export default MultiSwitch;
