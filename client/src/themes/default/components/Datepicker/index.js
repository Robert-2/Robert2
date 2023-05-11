import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import Datepicker from 'vue2-datepicker';
import Fragment from '@/components/Fragment';
import * as langs from './locale';

export const TYPES = ['date', 'datetime'];

// @vue/component
export default defineComponent({
    name: 'Datepicker',
    inject: {
        'input.invalid': { default: { value: false } },
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: { type: String, default: null },
        type: {
            validator: (type) => TYPES.includes(type),
            default: 'date',
        },
        value: {
            default: undefined,
            validator(value) {
                const isValidDateString = (_date) => (
                    [undefined, null].includes(_date) ||
                    (typeof _date === 'string' && moment(_date).isValid())
                );

                if (Array.isArray(value)) {
                    return !value.some((_date) => (
                        !isValidDateString(_date)
                    ));
                }

                return isValidDateString(value);
            },
        },
        disabled: { type: Boolean, default: undefined },
        invalid: { type: Boolean, default: undefined },
        placeholder: { type: String, default: undefined },
        range: { type: Boolean, default: false },
        disabledDates: { type: Object, default: undefined },
    },
    data() {
        const { locale } = this.$store.state.i18n;

        return {
            lang: langs[locale] || undefined,
            formatter: {
                stringify: (date, format) => (
                    date ? moment(date).format(format) : ''
                ),
                parse: (value) => (
                    value ? moment(value).toDate() : null
                ),
            },
        };
    },
    computed: {
        inheritedInvalid() {
            if (this.invalid !== undefined) {
                return this.invalid;
            }
            return this['input.invalid'].value;
        },

        inheritedDisabled() {
            if (this.disabled !== undefined) {
                return this.disabled;
            }
            return this['input.disabled'].value;
        },

        displayFormat() {
            return this.type === 'datetime'
                ? 'LL HH:mm'
                : 'LL';
        },

        outputFormat() {
            return this.type === 'datetime'
                ? 'YYYY-MM-DD HH:mm'
                : 'YYYY-MM-DD';
        },
    },
    methods: {
        handleInput(newValue) {
            this.$emit('input', newValue);
            this.$emit('change', newValue);
        },

        getDisabledDates(chosenDate) {
            if (!this.disabledDates) {
                return false;
            }

            const { from, to, notBetween } = this.disabledDates;
            const date = moment(chosenDate);

            if (Array.isArray(notBetween) && notBetween.length === 2) {
                const [start, end] = notBetween;
                return date.isBefore(start, 'day') || date.isAfter(end, 'day');
            }

            if (from && to) {
                return date.isAfter(from, 'day') && date.isBefore(to, 'day');
            }

            if (from) {
                return date.isAfter(from, 'day');
            }

            if (to) {
                return date.isBefore(to, 'day');
            }

            return false;
        },
    },
    render() {
        const {
            $t: __,
            name,
            lang,
            type,
            value,
            range,
            inheritedDisabled: disabled,
            inheritedInvalid: invalid,
            displayFormat,
            outputFormat,
            placeholder,
            formatter,
            handleInput,
            getDisabledDates,
        } = this;

        const renderHiddenInput = () => {
            if (!name || disabled) {
                return null;
            }

            if (range) {
                const [start, end] = value ?? [null, null];

                return (
                    <Fragment>
                        <input type="hidden" name={`${name}[start]`} value={start ?? ''} />
                        <input type="hidden" name={`${name}[end]`} value={end ?? ''} />
                    </Fragment>
                );
            }

            return <input type="hidden" name={name} value={value ?? ''} />;
        };

        const className = ['Datepicker', {
            'Datepicker--invalid': invalid,
        }];

        return (
            <div class={className}>
                <Datepicker
                    class="Datepicker__input"
                    disabled={disabled}
                    type={type}
                    range={range}
                    lang={lang}
                    onInput={handleInput}
                    value={value}
                    minuteStep={15}
                    showSecond={false}
                    clearable={false}
                    showTimeHeader={type === 'datetime'}
                    placeholder={placeholder}
                    formatter={formatter}
                    format={displayFormat}
                    valueType={outputFormat}
                    disabledDate={getDisabledDates}
                    rangeSeparator=" ⇒ "
                    confirm={type === 'datetime'}
                    confirmText={__('done')}
                />
                {renderHiddenInput()}
            </div>
        );
    },
});
