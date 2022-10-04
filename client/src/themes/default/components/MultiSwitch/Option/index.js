import './index.scss';

// @vue/component
export default {
    name: 'MultiSwitchOption',
    props: {
        label: { type: String, required: true },
        value: {
            validator: (value) => (
                ['string', 'number'].includes(typeof value) ||
                value === null
            ),
            required: true,
        },
        active: Boolean,
    },
    methods: {
        handleClick() {
            this.$emit('select', this.value);
        },
    },
    render() {
        const { label, value, active, handleClick } = this;

        const className = {
            'MultiSwitchOption': true,
            'MultiSwitchOption--active': active,
        };

        return (
            <label for={value} class={className}>
                <input
                    type="radio"
                    id={value}
                    class="MultiSwitchOption__input"
                    checked={active}
                    onClick={handleClick}
                />
                {label}
            </label>
        );
    },
};
