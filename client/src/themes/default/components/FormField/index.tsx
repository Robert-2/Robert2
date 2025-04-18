import './index.scss';
import warning from 'warning';
import { computed, defineComponent } from '@vue/composition-api';
import Select from '@/themes/default/components/Select';
import Radio from '@/themes/default/components/Radio';
import DatePicker, { Type as DatePickerType } from '@/themes/default/components/DatePicker';
import SwitchToggle from '@/themes/default/components/SwitchToggle';
import Input, { InputType } from '@/themes/default/components/Input';
import Textarea from '@/themes/default/components/Textarea';
import InputCopy from '@/themes/default/components/InputCopy';
import InputColor from '@/themes/default/components/InputColor';
import DateTime from '@/utils/datetime';
import Period from '@/utils/period';
import Color from '@/utils/color';
import Day from '@/utils/day';

import type { RawColor } from '@/utils/color';
import type { PropType } from '@vue/composition-api';
import type { ComponentRef } from 'vue';
import type { Option } from '@/themes/default/components/Select';
import type { DisableDateFunction } from '@/themes/default/components/DatePicker';

enum OtherType {
    COLOR = 'color',
    COPY = 'copy',
    STATIC = 'static',
    SELECT = 'select',
    RADIO = 'radio',
    TEXTAREA = 'textarea',
    SWITCH = 'switch',
    CUSTOM = 'custom',
}

type FieldType = DatePickerType | InputType | OtherType;

const TYPES: FieldType[] = [
    ...Object.values(DatePickerType),
    ...Object.values(InputType),
    ...Object.values(OtherType),
];

type Props = {
    /** Le label du champ de formulaire. */
    label?: string,

    /**
     * Le nom du champ (attribut `[name]`).
     *
     * Ceci permettra notamment de récupérer la valeur du champ dans
     * le jeu de données d'un formulaire parent lors de la soumission
     * (`submit`) de celui-ci.
     */
    name?: string,

    /**
     * Type du champ (e.g. `date`, `text`, `email`, `color`, etc.).
     * @see {@link FieldType} pour les types possibles.
     *
     * @default {@link InputType.TEXT}
     */
    type?: FieldType,

    /**
     * Le champ est-il requis pour soumettre le formulaire ?
     *
     * @default false
     */
    required?: boolean,

    /**
     * Le champ est-il désactivé ?
     *
     * @default false
     */
    disabled?: boolean,

    /**
     * Le champ doit-il être en lecture seule ?
     *
     * @default false
     */
    readonly?: boolean,

    /**
     * Un petit texte d'aide à afficher sous le champ.
     *
     * Note : il est également possible d'utiliser le `scopedSlots.help`
     * pour afficher un élément HTML ou un component.
     */
    help?: string,

    /**
     * Un texte d'erreur à afficher en rouge sous le champ, quand
     * une erreur de validation se produit.
     *
     * Si sa valeur est non-nulle, alors le champ sera marqué
     * comme invalide (avec un liseret rouge autour du champ).
     *
     * @default null
     */
    error?: string | null,

    /**
     * L'éventuel texte affiché en filigrane dans le champ, quand
     * celui-ci est vide.
     *
     * Si est égal à `true`, le texte sera le contenu de la prop `label`.
     *
     * @see {@link Select} pour utilisation avec le type {@link OtherType.SELECT}.
     * @see {@link InputColor} pour utilisation avec le type {@link OtherType.COLOR}.
     */
    placeholder?: string | boolean | Color | RawColor | null,

    /** La valeur actuelle du champ. */
    value?: (
        | string
        | number
        | boolean
        | Option['value']
        | Array<Option['value']>
        | null
        | Color
        | Period
        | Date
        | DateTime
        | Day
    ),

    /**
     * La taille (en nombre de lignes) du champ quand il s'agit
     * d'un champ de type {@link OtherType.TEXTAREA}.
     */
    rows?: number,

    /**
     * Un nombre qui définit la granularité de la valeur lorsque
     * le champ est de type {@link InputType.NUMBER}.
     */
    step?: number,

    /**
     * La valeur minimale qui peut être acceptée pour ce champ
     * lorsqu'il est de type {@link InputType.NUMBER}.
     */
    min?: number,

    /**
     * La valeur maximale qui peut être acceptée pour ce champ
     * lorsqu'il est de type {@link InputType.NUMBER}.
     */
    max?: number,

    /**
     * Texte ou élément supplémentaire à afficher à côté du champ,
     * lorsqu'il est de type {@link InputType}.
     *
     * @see {@link Input} pour plus de détails.
     */
    addon?: string,

    /**
     * Les options du champ lorsqu'il est de type `OtherType.SELECT`.
     *
     * @see {@link Select} pour plus de détails.
     */
    options?: string[] | Option[],

    /**
     * Lorsque le champ est de type `OtherType.SELECT`,
     * s'agit-il d'un sélecteur à choix multiple ?
     *
     * @see {@link Select} pour plus de détails.
     * @default false
     */
    multiple?: boolean,

    /**
     * Lorsque le champ est de type `OtherType.SELECT`,
     * peut-on créer une nouvelle valeur en l'écrivant dans le champ ?
     *
     * @see {@link Select} pour plus de détails.
     * @default false
     */
    canCreate?: boolean,

    /**
     * Sert à définir le mode "période" lorsqu'il s'agit d'un
     * champ de type {@link DatePickerType}.
     *
     * @see {@link DatePicker} pour plus de détails.
     * @default false
     */
    range?: boolean,

    /**
     * Date minimum sélectionnable lorsqu'il s'agit d'un champ
     * de type {@link DatePickerType}.
     */
    minDate?: string | DateTime,

    /**
     * Date maximum sélectionnable lorsqu'il s'agit d'un champ
     * de type {@link DatePickerType}.
     */
    maxDate?: string | DateTime,

    /**
     * Une éventuelle fonction permettant de désactiver certaines
     * dates, lorsqu'il s'agit d'un champ de type {@link DatePickerType}.
     *
     * @see {@link DatePicker} pour plus de détails.
     */
    disabledDate: DisableDateFunction,

    /**
     * Active la permutation des "Jours entiers", lorsqu'il s'agit
     * d'un champ de type {@link DatePickerType}.
     *
     * @see {@link DatePicker} pour plus de détails.
     * @default false
     */
    withFullDaysToggle: boolean,

    /**
     * Lorsqu'il s'agit d'un champ de type {@link DatePickerType.DATETIME},
     * doit-on cacher la sélection des minutes ?
     *
     * @default false
     */
    withoutMinutes: boolean,
};

/** Champ de formulaire (de n'importe quel type). */
const FormField = defineComponent({
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
        label: {
            type: String as PropType<Props['label']>,
            default: undefined,
        },
        name: {
            type: String as PropType<Props['name']>,
            default: undefined,
        },
        type: {
            type: String as PropType<Required<Props>['type']>,
            validator: (_type: any) => TYPES.includes(_type),
            default: InputType.TEXT,
        },
        required: {
            type: Boolean as PropType<Props['required']>,
            default: false,
        },
        disabled: {
            type: [Boolean, String] as PropType<Props['disabled']>,
            default: false,
        },
        readonly: {
            type: [Boolean, String] as PropType<Props['readonly']>,
            default: false,
        },
        help: {
            type: String as PropType<Props['help']>,
            default: undefined,
        },
        error: {
            type: String as PropType<Props['error']>,
            default: null,
        },
        placeholder: {
            // NOTE: Attention à ne pas mettre `Boolean` en premier, sans quoi
            //       passer `placeholder=""` donnera `placeholder={true}`.
            type: [String, Boolean, Object] as PropType<Props['placeholder']>,
            default: undefined,
        },
        value: {
            type: [
                // NOTE: Attention à ne pas mettre `Boolean` en premier, sans quoi
                //       passer `value=""` donnera `value={true}`.
                String,
                Number,
                Date,
                Boolean,
                Array,
                Color,
                Period,
                DateTime,
                Day,
            ] as PropType<Props['value']>,
            default: undefined,
        },
        rows: {
            type: Number as PropType<Props['rows']>,
            default: undefined,
        },
        step: {
            type: Number as PropType<Props['step']>,
            default: undefined,
        },
        min: {
            type: Number as PropType<Props['min']>,
            default: undefined,
        },
        max: {
            type: Number as PropType<Props['max']>,
            default: undefined,
        },
        addon: {
            type: String as PropType<Props['addon']>,
            default: undefined,
        },
        options: {
            type: Array as PropType<Props['options']>,
            default: undefined,
        },
        multiple: {
            type: Boolean as PropType<Props['multiple']>,
            default: false,
        },
        canCreate: {
            type: Boolean as PropType<Props['canCreate']>,
            default: false,
        },

        // - Props. spécifiques aux sélecteurs de date.
        range: {
            type: Boolean as PropType<Props['range']>,
            default: false,
        },
        minDate: {
            type: [String, DateTime] as PropType<Props['minDate']>,
            default: undefined,
        },
        maxDate: {
            type: [String, DateTime] as PropType<Props['maxDate']>,
            default: undefined,
        },
        disabledDate: {
            type: Function as PropType<Props['disabledDate']>,
            default: undefined,
        },
        withFullDaysToggle: {
            type: Boolean as PropType<Props['withFullDaysToggle']>,
            default: false,
        },
        withoutMinutes: {
            type: Boolean as PropType<Props['withoutMinutes']>,
            default: false,
        },
    },
    emits: ['change', 'input', 'create'],
    computed: {
        invalid(): boolean {
            return (this.error ?? null) !== null;
        },

        normalizedPlaceholder(): string | boolean | undefined {
            const { $t: __, placeholder, type, label } = this;

            if (placeholder === undefined) {
                return undefined;
            }

            if (type === OtherType.SELECT) {
                return typeof placeholder === 'boolean' ? placeholder : __(placeholder as string);
            }

            if (!placeholder) {
                return undefined;
            }

            return placeholder === true ? label : __(placeholder as string);
        },
    },
    watch: {
        $slots: {
            immediate: true,
            handler() {
                // @ts-expect-error -- `this` fait bien référence au component.
                this.validateProps();
            },
        },
        $props: {
            immediate: true,
            handler() {
                // @ts-expect-error -- `this` fait bien référence au component.
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

        handleChange(...newValue: any) {
            this.$emit('change', ...newValue);
        },

        handleInput(...newValue: any) {
            this.$emit('input', ...newValue);
        },

        handleCreateOption(...newValue: any) {
            this.$emit('create', ...newValue);
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
            const $input = this.$refs.input as ComponentRef<typeof Input | typeof Textarea>;
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
                this.type !== OtherType.CUSTOM || hasChildren,
                '<FormField> La prop. `children` est manquante (ou vide) alors ' +
                `qu'elle est requise pour les champs \`custom\`.`,
            );

            // - Affiche un warning si si on a un champ non-`custom` et qu'une fonction de rendue a été fournie.
            warning(
                this.type === OtherType.CUSTOM || !hasChildren,
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
            customUselessProps.forEach((customUselessProp: string) => {
                warning(
                    this.type !== 'custom' || !(customUselessProp in (this.$options.propsData ?? {})),
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
            error,
            placeholder,
            normalizedPlaceholder,
            required,
            invalid,
            disabled,
            readonly,
            verticalForm: vertical,
            options,
            multiple,
            canCreate,
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
            handleCreateOption,
            handleChange,
            handleInput,
        } = this;

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
                        {(Object.values(InputType) as string[]).includes(type) && (
                            <Input
                                ref="input"
                                class="FormField__input"
                                type={type}
                                step={step}
                                min={min}
                                max={max}
                                name={name}
                                autocomplete={type === InputType.PASSWORD ? 'new-password' : 'off'}
                                disabled={!!(disabled || readonly)}
                                invalid={invalid}
                                placeholder={normalizedPlaceholder}
                                value={value}
                                addon={addon}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {type === OtherType.SELECT && (
                            <Select
                                class="FormField__input"
                                name={name}
                                options={options}
                                placeholder={normalizedPlaceholder}
                                disabled={!!(disabled || readonly)}
                                invalid={invalid}
                                value={value}
                                multiple={multiple}
                                canCreate={canCreate}
                                onInput={handleInput}
                                onChange={handleChange}
                                onCreate={handleCreateOption}
                            />
                        )}
                        {type === OtherType.RADIO && (
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
                        {type === OtherType.TEXTAREA && (
                            <Textarea
                                ref="input"
                                class="FormField__input"
                                name={name}
                                value={value}
                                rows={rows}
                                disabled={!!(disabled || readonly)}
                                invalid={invalid}
                                placeholder={normalizedPlaceholder}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {(Object.values(DatePickerType) as string[]).includes(type) && (
                            <DatePicker
                                class="FormField__input"
                                name={name}
                                type={type}
                                value={value}
                                range={range}
                                invalid={invalid}
                                disabled={!!disabled}
                                readonly={readonly}
                                placeholder={normalizedPlaceholder}
                                minDate={minDate}
                                maxDate={maxDate}
                                disabledDate={disabledDate}
                                withFullDaysToggle={withFullDaysToggle}
                                withoutMinutes={withoutMinutes}
                                onInput={handleInput}
                                onChange={handleChange}
                            />
                        )}
                        {type === OtherType.COLOR && (
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
                        {type === OtherType.SWITCH && (
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
                        {type === OtherType.COPY && (
                            <InputCopy class="FormField__input" value={value} />
                        )}
                        {type === OtherType.CUSTOM && (
                            <div class="FormField__input">
                                {children}
                            </div>
                        )}
                        {type === OtherType.STATIC && (
                            <p class="FormField__input">{value}</p>
                        )}
                    </div>
                    {invalid && (
                        <div class="FormField__error">
                            <span class="FormField__error__text">{error}</span>
                        </div>
                    )}
                    {!!(!invalid && (slots.help || help)) && (
                        <div class="FormField__help">{slots.help?.(undefined) ?? help}</div>
                    )}
                </div>
            </div>
        );
    },
});

export default FormField;
