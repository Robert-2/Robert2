import './index.scss';
import { defineComponent } from '@vue/composition-api';

// @vue/component
export default defineComponent({
    name: 'SwitchToggle',
    inject: {
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: { type: String, default: null },
        value: { type: Boolean, required: true },
        disabled: { type: [Boolean, String], default: undefined },
        hideLabel: { type: Boolean, default: undefined },
    },
    computed: {
        inheritedDisabled() {
            if (this.disabled !== undefined) {
                return this.disabled;
            }
            return this['input.disabled'].value;
        },

        disabledReason() {
            if (!this.inheritedDisabled || typeof this.inheritedDisabled !== 'string') {
                return null;
            }

            const reason = this.inheritedDisabled.trim();
            return reason.length > 0 ? reason : null;
        },
    },
    methods: {
        handleSwitch() {
            if (this.inheritedDisabled) {
                return;
            }

            const newValue = !this.value;
            this.$emit('input', newValue);
            this.$emit('change', newValue);
        },
    },
    render() {
        const {
            $t: __,
            name,
            value,
            inheritedDisabled: disabled,
            disabledReason,
            handleSwitch,
            hideLabel,
        } = this;

        const classNames = ['SwitchToggle', {
            'SwitchToggle--toggled': value,
            'SwitchToggle--disabled': !!disabled,
        }];

        return (
            <div class={classNames} onClick={handleSwitch}>
                <div class="SwitchToggle__slide">
                    <div class="SwitchToggle__button" />
                </div>
                {!hideLabel && (
                    <div class="SwitchToggle__label">
                        {value && <span>{__('yes')}</span>}
                        {!value && <span>{__('no')}</span>}
                        {!!(disabled && disabledReason) && (
                            <span class="SwitchToggle__label__disabled-reason">
                                ({__('locked')}: {disabledReason})
                            </span>
                        )}
                    </div>
                )}
                {!!(name && !disabled) && (
                    <input type="hidden" name={name} value={value ? '1' : '0'} />
                )}
            </div>
        );
    },
});
