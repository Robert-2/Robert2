import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import Datepicker from '@/components/Datepicker';
import SwitchToggle from '@/components/SwitchToggle';

const ALLOWED_TYPES = [
    'text',
    'email',
    'static',
    'password',
    'number',
    'tel',
    'select',
    'textarea',
    'date',
    'switch',
];

// @vue/component
export default defineComponent({
    name: 'FormField',
    props: {
        label: { type: String, default: null },
        name: { type: String, default: null },
        type: {
            validator: (value) => ALLOWED_TYPES.includes(value),
            default: 'text',
        },
        required: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        disabledReason: { type: String, default: null },
        placeholder: { type: [String, Boolean], default: false },
        value: {
            type: [String, Number, Date, Array, Boolean],
            default: '',
        },
        step: { type: Number, default: 0.01 },
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        addon: { type: String, default: null },
        options: { type: Array, default: () => [] },
        errors: { type: Array, default: null },
        datepickerOptions: { type: Object, default: null },
    },
    data() {
        return {
            renderKey: 1,
        };
    },
    watch: {
        options() {
            this.renderKey += 1;
        },
    },
    methods: {
        handleInput(event) {
            const { value } = event.target;
            this.$emit('input', value, event);
        },

        handleChange(event) {
            const { value } = event.target;
            this.$emit('change', value, event);
        },

        handleDatepickerChange(newDate) {
            this.$emit('input', newDate);

            let newValue;
            if (Array.isArray(newDate)) {
                newValue = newDate.map((date) => moment(date).format('YYYY-MM-DD'));
            } else {
                newValue = moment(newDate).format('YYYY-MM-DD');
            }

            this.$emit('change', { field: this.name, newValue, newDate });
        },

        handleSwitchChange(newValue) {
            this.$emit('input', newValue);
            this.$emit('change', { field: this.name, newValue });
        },
    },
    render() {
        const {
            $t: __,
            $scopedSlots: slots,
            type,
            label,
            name,
            value,
            addon,
            placeholder,
            required,
            disabled,
            disabledReason,
            options,
            step,
            min,
            max,
            datepickerOptions,
            handleInput,
            handleChange,
            handleDatepickerChange,
            handleSwitchChange,
            errors,
            renderKey,
        } = this;

        // - Placeholder.
        let _placeholder;
        if (placeholder) {
            // eslint-disable-next-line no-nested-ternary
            _placeholder = placeholder === true
                ? (type === 'select' ? __('please-choose') : label)
                : __(placeholder);
        }

        const classNames = ['FormField', {
            'FormField--with-addon': !!addon,
            'FormField--with-error': errors && errors.length > 0,
        }];

        return (
            <div class={classNames}>
                {label && (
                    <label class="FormField__label">
                        {__(label)} {required && <span class="FormField__label__required">*</span>}
                    </label>
                )}
                {['text', 'email', 'tel', 'password', 'number'].includes(type) && (
                    <div class="FormField__input-wrapper">
                        <input
                            type={type}
                            step={type === 'number' ? (step || 0.01) : null}
                            min={type === 'number' && (min || min === 0) ? min : null}
                            max={type === 'number' && (max || max === 0) ? max : null}
                            name={name}
                            autocomplete={type === 'password' ? 'new-password' : 'off'}
                            disabled={disabled}
                            placeholder={_placeholder}
                            class="FormField__input"
                            value={value}
                            onInput={handleInput}
                            onChange={handleChange}
                        />
                        {addon && <div class="FormField__addon">{addon}</div>}
                    </div>
                )}
                {type === 'select' && (
                    <select
                        key={renderKey}
                        name={name}
                        class="FormField__select"
                        value={value}
                        disabled={disabled}
                        onInput={handleInput}
                        onChange={handleChange}
                    >
                        {_placeholder !== undefined && <option value="">{_placeholder}</option>}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {__(option.label)}
                            </option>
                        ))}
                    </select>
                )}
                {type === 'textarea' && (
                    <textarea
                        name={name}
                        value={value}
                        disabled={disabled}
                        placeholder={_placeholder}
                        class="FormField__textarea"
                        onInput={handleInput}
                    />
                )}
                {type === 'date' && (
                    <Datepicker
                        value={typeof value === 'string' ? moment(value).toDate() : value}
                        displayFormat={datepickerOptions?.format}
                        disabledDates={datepickerOptions?.disabled}
                        isRange={datepickerOptions?.isRange}
                        withTime={datepickerOptions?.withTime}
                        placeholder={_placeholder}
                        class="FormField__datepicker"
                        onInput={handleDatepickerChange}
                    />
                )}
                {type === 'switch' && (
                    <div class="FormField__switch">
                        <SwitchToggle
                            value={value ?? false}
                            locked={disabled}
                            lockedReason={disabledReason}
                            onInput={handleSwitchChange}
                        />
                        <input
                            type="hidden"
                            name={name}
                            value={value ? '1' : '0'}
                            readonly
                        />
                    </div>
                )}
                {type === 'static' && (
                    <p class="FormField__static-value">{value}</p>
                )}
                {errors && (
                    <div class="FormField__error">
                        <span class="FormField__error__text">{errors[0]}</span>
                    </div>
                )}
                {(!errors && slots.help) && <div class="FormField__help">{slots.help()}</div>}
            </div>
        );
    },
});
