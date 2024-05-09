import './index.scss';
import warning from 'warning';
import { computed, defineComponent } from '@vue/composition-api';
import Select from '@/themes/default/components/Select';
import Radio from '@/themes/default/components/Radio';
import DatePicker, { Type as DatePickerType } from '@/themes/default/components/DatePicker';
import SwitchToggle from '@/themes/default/components/SwitchToggle';
import Input, { TYPES as INPUT_TYPES } from '@/themes/default/components/Input';
import Textarea from '@/themes/default/components/Textarea';
import InputCopy from '@/themes/default/components/InputCopy';
import InputColor from '@/themes/default/components/InputColor';
import DateTime from '@/utils/datetime';
import Period from '@/utils/period';
import Color from '@/utils/color';
import Day from '@/utils/day';

const TYPES = [
    ...Object.values(DatePickerType),
    ...INPUT_TYPES,
    'color',
    'copy',
    'static',
    'select',
    'radio',
    'textarea',
    'switch',
    'custom',
];

// @vue/component
export default defineComponent({
    name: 'FormField',
    inject: {
        verticalForm: { default: false },
    },
    provide() {
        return {
            'input.disabled': computed(() => this.disabled),
            'input.invalid': computed(() => this.invalid),
        };
    },
    props: {
        label: { type: String, default: null },
        name: { type: String, default: undefined },
        type: {
            validator: (value) => TYPES.includes(value),
            default: 'text',
        },
        required: { type: Boolean, default: false },
        disabled: { type: [Boolean, String], default: false },
        readonly: { type: [Boolean, String], default: false },
        help: { type: String, default: undefined },
        errors: { type: Array, default: null },
        placeholder: {
            // NOTE: Attention à ne pas mettre `Boolean` en premier, sans quoi
            //       passer `placeholder=""` donnera `placeholder={true}`.
            // eslint-disable-next-line vue/prefer-prop-type-boolean-first
            type: [String, Boolean, Object],
            default: undefined,
        },
        value: {
            type: [
                // NOTE: Attention à ne pas mettre `Boolean` en premier, sans quoi
                //       passer `value=""` donnera `value={true}`.
                /* eslint-disable vue/prefer-prop-type-boolean-first */
                String,
                Number,
                Date,
                Boolean,
                Array,
                Color,
                Period,
                DateTime,
                Day,
                /* eslint-enable vue/prefer-prop-type-boolean-first */
            ],
            default: undefined,
        },
        rows: { type: Number, default: undefined },
        step: { type: Number, default: undefined },
        min: { type: Number, default: undefined },
        max: { type: Number, default: undefined },
        addon: { type: String, default: undefined },
        options: { type: Array, default: undefined },

        // - Props. spécifiques aux datepickers.
        range: { type: Boolean, default: false },
        minDate: {
            type: [String, DateTime],
            default: undefined,
        },
        maxDate: {
            type: [String, DateTime],
            default: undefined,
        },
        disabledDate: { type: Function, default: undefined },
        withFullDaysToggle: { type: Boolean, default: false },
        withoutMinutes: { type: Boolean, default: false },
    },
    emits: ['change', 'input'],
    computed: {
        invalid() {
            return this.errors && this.errors.length > 0;
        },
    },
    watch: {
        $slots: {
            immediate: true,
            handler() {
                this.validateProps();
            },
        },
        $props: {
            immediate: true,
            handler() {
                this.validateProps();
            },
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange(...newValue) {
            this.$emit('change', ...newValue);
        },

        handleInput(...newValue) {
            this.$emit('input', ...newValue);
        },

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        /**
         * Permet de donner le focus au champ de formulaire.
         */
        focus() {
            // FIXME: Devrait prendre en charge le focus de n'importe
            //        quel champ, pas seulement `<Input />` / `<Textarea />`.
            /** @type {import('vue').ComponentRef<typeof Input | typeof Textarea>} */
            const $input = this.$refs.input;
            $input?.focus();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        validateProps() {
            const hasChildren = this.$slots.default !== undefined;

            // - Fonction de rendu manquante pour un champ `custom`.
            warning(
                this.type !== 'custom' || hasChildren,
                '<FormField> La prop. `children` est manquante (ou vide) alors ' +
                `qu'elle est requise pour les champs \`custom\`.`,
            );

            // - Affiche un warning si si on a un champ non-`custom` et qu'une fonction de rendue a été fournie.
            warning(
                this.type === 'custom' || !hasChildren,
                '<FormField> La prop. `children` a été fournie pour un champ non ' +
                '`custom`, celle-ci ne sera pas utilisée.',
            );

            // - Affiche un warning si des props. sont passés à <FormField>
            //   alors qu'on est dans un champ `custom`.
            const customUselessProps = [
                'name', 'placeholder', 'value', 'rows', 'step',
                'min', 'max', 'addon', 'options', 'disabledDate',
                'minDate', 'maxDate', 'withFullDaysToggle', 'range',
                'withoutMinutes',
            ];
            customUselessProps.forEach((customUselessProp) => {
                warning(
                    this.type !== 'custom' || !(customUselessProp in this.$options.propsData),
                    `<FormField> La prop. \`${customUselessProp}\` a été fournie pour ` +
                    'un champ "custom", celle-ci ne sera pas utilisée.',
                );
            });
        },
    },
    render() {
        const children = this.$slots.default;
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
            invalid,
            disabled,
            readonly,
            verticalForm: vertical,
            options,
            step,
            min,
            max,
            rows,
            help,
            range,
            minDate,
            maxDate,
            disabledDate,
            withoutMinutes,
            withFullDaysToggle,
            handleChange,
            handleInput,
            errors,
        } = this;

        // - Placeholder.
        let _placeholder;
        if (placeholder !== undefined) {
            if (type === 'select') {
                _placeholder = typeof placeholder === 'boolean' ? placeholder : __(placeholder);
            } else if (placeholder) {
                _placeholder = placeholder === true ? label : __(placeholder);
            }
        }

        const classNames = ['FormField', `FormField--${type}`, {
            'FormField--vertical': !!vertical,
            'FormField--invalid': invalid,
        }];

        return (
            <div class={classNames}>
                {label && (
                    <label class="FormField__label">
                        {__(label)} {required && <span class="FormField__label__required">*</span>}
                    </label>
                )}
                <div class="FormField__field">
                    <div class="FormField__input-wrapper">
                        {INPUT_TYPES.includes(type) && (
                            <Input
                                ref="input"
                                class="FormField__input"
                                type={type}
                                step={step}
                                min={min}
                                max={max}
                                name={name}
                                autocomplete={type === 'password' ? 'new-password' : 'off'}
                                disabled={!!(disabled || readonly)}
                                invalid={invalid}
                                placeholder={_placeholder}
                                value={value}
                                addon={addon}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {type === 'select' && (
                            <Select
                                class="FormField__input"
                                name={name}
                                options={options}
                                placeholder={_placeholder}
                                disabled={!!(disabled || readonly)}
                                invalid={invalid}
                                value={value}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {type === 'radio' && (
                            <Radio
                                class="FormField__input"
                                name={name}
                                options={options}
                                disabled={!!(disabled || readonly)}
                                invalid={invalid}
                                value={value}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {type === 'textarea' && (
                            <Textarea
                                ref="input"
                                class="FormField__input"
                                name={name}
                                value={value}
                                rows={rows}
                                disabled={!!(disabled || readonly)}
                                invalid={invalid}
                                placeholder={_placeholder}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {Object.values(DatePickerType).includes(type) && (
                            <DatePicker
                                class="FormField__input"
                                name={name}
                                type={type}
                                value={value}
                                range={range}
                                invalid={invalid}
                                disabled={!!disabled}
                                readonly={readonly}
                                placeholder={_placeholder}
                                minDate={minDate}
                                maxDate={maxDate}
                                disabledDate={disabledDate}
                                withFullDaysToggle={withFullDaysToggle}
                                withoutMinutes={withoutMinutes}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {type === 'color' && (
                            <InputColor
                                class="FormField__input"
                                name={name}
                                disabled={!!(disabled || readonly)}
                                invalid={invalid}
                                value={value}
                                placeholder={placeholder}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {type === 'switch' && (
                            <SwitchToggle
                                class="FormField__input"
                                name={name}
                                options={options}
                                value={value ?? false}
                                disabled={(
                                    typeof disabled !== 'string'
                                        ? !!(disabled || readonly)
                                        : disabled
                                )}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {type === 'copy' && (
                            <InputCopy class="FormField__input" value={value} />
                        )}
                        {type === 'custom' && (
                            <div class="FormField__input">
                                {children}
                            </div>
                        )}
                        {type === 'static' && (
                            <p class="FormField__input">{value}</p>
                        )}
                    </div>
                    {invalid && (
                        <div class="FormField__error">
                            <span class="FormField__error__text">{errors[0]}</span>
                        </div>
                    )}
                    {!!(!invalid && (slots.help || help)) && (
                        <div class="FormField__help">{slots.help?.() ?? help}</div>
                    )}
                </div>
            </div>
        );
    },
});
