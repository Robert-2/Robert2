import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import CoreDatepicker from 'vue2-datepicker';
import Fragment from '@/components/Fragment';
import Switch from '@/themes/default/components/SwitchToggle';
import Button from '@/themes/default/components/Button';
import frPickerTranslations from 'vue2-datepicker/locale/es/fr';
import enPickerTranslations from 'vue2-datepicker/locale/es/en';
import { Type } from './_types';
import {
    normalizeValue,
    RANGE_SNIPPETS,
    DATE_SNIPPETS,
    MINUTES_STEP,
} from './_utils';

import type { Moment, MomentInput } from 'moment';
import type { PropType } from '@vue/composition-api';
import type {
    Formatter,
    Translations,
    DatePickerEmit,
    TimePickerOptions,
    DatePickerSlotParams,
} from 'vue2-datepicker';
import type {
    LooseValue,
    LooseDateValue,
    Value,
    Snippet,
    RawDateSnippet,
    RawRangeSnippet,
} from './_types';

const PICKER_TRANSLATIONS: Record<string, Translations> = {
    fr: frPickerTranslations,
    en: enPickerTranslations,
};

type Props<IsRange extends boolean = boolean> = {
    /**
     * Le nom du champ (attribut `[name]`).
     *
     * Ceci permettra notamment de récupérer la valeur du champ dans
     * le jeu de données d'un formulaire parent lors de la soumission
     * (`submit`) de celui-ci.
     */
    name?: string,

    /**
     * Le type de champ de sélection de date parmi :
     * - `date`: Sélection de date sans heure.
     * - `datetime`: Sélection de date et heure.
     *
     * Attention, la prop. `canT`
     *
     * @default Type.DATE
     */
    type?: Type,

    /**
     * Mode "période".
     *
     * - Si `true`, une date de début et de fin devront être sélectionnées.
     * - Si `false`, une seule date devra être sélectionnée.
     *
     * @default false
     */
    range?: IsRange,

    /**
     * Active la permutation des "Jours entiers".
     *
     * Ce mode est uniquement compatible avec les types `date` et `datetime`.
     *
     * - Si `true`, l'utilisateur pourra choisir d'activer ou non le mode "Jour(s) entier(s)".
     * - Si `false`, le mode "Jour(s) entier(s)" ne sera pas proposé.
     *
     * Si cette option est activée, il faudra veiller à observer l'événement `onChange` et notamment
     * son deuxième paramètre (qui ne sera passé que quand cette option est activée) qui contiendra
     * un booléen `isFullDays`. S'il est à `true`, il faudra veiller à changer le type en `DATE` et
     * dans le cas contraire en `DATETIME`.
     *
     * À noter aussi que si cette option est activée et que la prop. `name` est spécifiée, un champ
     * hidden `is_full_days` sera utilisé pour stocker la valeur courante du switch.
     *
     * @default false
     */
    withFullDaysToggle?: boolean,

    /**
     * Active l'affichage des "snippets" / raccourcis de sélection de période.
     * (e.g. "Cette semaine", "Ce mois", etc.)
     */
    withSnippets?: boolean,

    /**
     * En mode `datetime`, doit-on cacher la sélection des minutes ?
     *
     * @default false
     */
    withoutMinutes?: boolean,

    /** Date minimum sélectionnable dans le sélecteur. */
    minDate?: 'now' | Moment | Date | string | number,

    /** Date maximum sélectionnable dans le sélecteur. */
    maxDate?: 'now' | Moment | Date | string | number,

    /**
     * Une éventuelle fonction permettant de désactiver certaines dates.
     *
     * - Si la fonction renvoie `true`, la date ne sera pas sélectionnable.
     * - Si elle renvoie `false`, elle le sera.
     */
    disabledDate?(date: Moment, granularity: 'day' | 'minute'): boolean,

    /** La valeur actuelle du champ. */
    value: LooseValue<IsRange>,

    /**
     * L'éventuel texte affiché en filigrane dans le
     * champ quand celui-ci est vide.
     */
    placeholder?: string,

    /** Le champ est-il désactivé ?  */
    disabled?: boolean,

    /** Le champ doit-il être marqué comme invalide ? */
    invalid?: boolean,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    showTimePanel: boolean,
    now: number,
};

const FORMATTER: Formatter = {
    stringify: (date: Date | null | undefined, format: string): string => (
        date ? moment(date).format(format) : ''
    ),
    parse: (value: LooseDateValue): Date | null => (
        value ? moment(value).toDate() : null
    ),
};

/** Un sélecteur de date(s), heure(s) et période. */
const Datepicker = defineComponent({
    name: 'Datepicker',
    inject: {
        'input.invalid': { default: { value: false } },
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: {
            type: String as PropType<Props['name']>,
            default: undefined,
        },
        type: {
            type: String as PropType<Required<Props>['type']>,
            default: Type.DATE,
            validator: (value: unknown) => {
                if (typeof value !== 'string') {
                    return false;
                }
                return (Object.values(Type) as string[]).includes(value);
            },
        },
        value: {
            type: [Array, String] as PropType<Props['value']>,
            default: null,
            validator: (value: unknown) => {
                const isValidDateString = (date: unknown): boolean => (
                    [undefined, null].includes(date as any) ||
                    (typeof date === 'string' && moment(date).isValid())
                );

                if (Array.isArray(value)) {
                    return !value.some((date: unknown) => (
                        !isValidDateString(date)
                    ));
                }

                return isValidDateString(value);
            },
        },
        range: {
            type: Boolean as PropType<Required<Props>['range']>,
            default: false,
        },
        disabledDate: {
            type: Function as PropType<Props['disabledDate']>,
            default: undefined,
        },
        minDate: {
            type: [String, Object, Date, Number] as PropType<Props['minDate']>,
            default: undefined,
        },
        maxDate: {
            type: [String, Object, Date, Number] as PropType<Props['maxDate']>,
            default: undefined,
        },
        withFullDaysToggle: {
            type: Boolean as PropType<Required<Props>['withFullDaysToggle']>,
            default: false,
        },
        withSnippets: {
            type: Boolean as PropType<Required<Props>['withSnippets']>,
            default: false,
        },
        withoutMinutes: {
            type: Boolean as PropType<Required<Props>['withoutMinutes']>,
            default: false,
        },
        disabled: {
            type: Boolean as PropType<Props['disabled']>,
            default: undefined,
        },
        invalid: {
            type: Boolean as PropType<Props['invalid']>,
            default: undefined,
        },
        placeholder: {
            type: String as PropType<Props['placeholder']>,
            default: undefined,
        },
    },
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data(): Data {
        return {
            showTimePanel: false,
            now: Date.now(),
        };
    },
    emit: ['input', 'change'],
    computed: {
        isFullDays(): boolean {
            return this.type === Type.DATE;
        },

        normalizedValue(): Value {
            return normalizeValue(
                this.value,
                this.type,
                this.range,
                this.withoutMinutes,
            );
        },

        inheritedInvalid(): boolean {
            if (this.invalid !== undefined) {
                return this.invalid;
            }

            // @ts-expect-error -- Normalement fixé lors du passage à Vue 3 (et son meilleur typage).
            // @see https://github.com/vuejs/core/pull/6804
            return this['input.invalid'].value;
        },

        inheritedDisabled(): boolean {
            if (this.disabled !== undefined) {
                return this.disabled;
            }

            // @ts-expect-error -- Normalement fixé lors du passage à Vue 3 (et son meilleur typage).
            // @see https://github.com/vuejs/core/pull/6804
            return this['input.disabled'].value;
        },

        displayFormat(): string {
            const dateFormat = this.range ? 'll' : 'LL';

            return this.type === Type.DATETIME
                ? `${dateFormat} HH:mm`
                : dateFormat;
        },

        timePickerOptions(): TimePickerOptions {
            const step = !this.withoutMinutes
                ? `00:${MINUTES_STEP.toString().padStart(2, '0')}`
                : '01:00';

            // - Dans le cas ou on veut les minutes, on récupère la dernière "step" la prochaine
            //   heure (e.g. Step: 15min => `XX:45`, Step: 10min => `XX:50`), sinon, on utilise
            //   la minute `0`.
            const endMinute = !this.withoutMinutes
                ? (((60 / MINUTES_STEP) - 1) * MINUTES_STEP)
                : 0;

            return {
                start: '00:00',
                step,
                end: `23:${endMinute.toString().padStart(2, '0')}`,
                format: 'HH:mm',
            };
        },

        outputFormat(): string {
            return this.type === Type.DATETIME
                ? 'YYYY-MM-DD HH:mm:ss'
                : 'YYYY-MM-DD';
        },

        dateFormat(): string {
            const currentLocaleData = moment.localeData();
            return currentLocaleData.longDateFormat('LL');
        },

        translations(): Translations {
            const { locale } = this.$store.state.i18n;
            return PICKER_TRANSLATIONS[locale] ?? undefined;
        },

        disabledDateFactory(): ((granularity: 'day' | 'minute') => (rawDate: MomentInput) => boolean) {
            const {
                now,
                disabledDate,
                type,
                minDate: rawMinDate,
                maxDate: rawMaxDate,
            } = this;
            const withHours = type === Type.DATETIME;
            const withMinutes = withHours && !this.withoutMinutes;

            return (granularity: 'day' | 'minute') => (rawDate: MomentInput): boolean => {
                const date = moment(rawDate);

                if (disabledDate !== undefined && disabledDate(date, granularity)) {
                    return true;
                }

                if (rawMinDate !== undefined) {
                    const minDate: Moment = (() => {
                        if (rawMinDate === 'now') {
                            if (withHours) {
                                if (withMinutes) {
                                    return moment(now).startOf('minute');
                                }
                                return moment(now).startOf('hour');
                            }
                            return moment(now).startOf('day');
                        }
                        return moment(rawMinDate);
                    })();
                    if (date.isBefore(minDate, granularity)) {
                        return true;
                    }
                }

                if (rawMaxDate !== undefined) {
                    const maxDate: Moment = (() => {
                        if (rawMaxDate === 'now') {
                            if (withHours) {
                                if (withMinutes) {
                                    return moment(now).endOf('minute');
                                }
                                return moment(now).endOf('hour');
                            }
                            return moment(now).endOf('day');
                        }
                        return moment(rawMaxDate);
                    })();
                    if (date.isAfter(maxDate, granularity)) {
                        return true;
                    }
                }
                return false;
            };
        },

        snippets(): Snippet[][] {
            if (this.disabled) {
                return [];
            }
            const { __, now } = this;

            if (!this.range) {
                return DATE_SNIPPETS.map((snippetGroup: RawDateSnippet[]): Snippet[] => (
                    snippetGroup.map((snippet: RawDateSnippet): Snippet => {
                        const { labelKey, period: periodFunc } = snippet;
                        const currentValue = this.normalizedValue as Value<false>;
                        const period = periodFunc(moment(now));

                        return {
                            label: __(labelKey),
                            periodLabel: period.format('ll'),
                            isActive: (
                                currentValue !== null
                                    ? period.isSame(currentValue, 'day')
                                    : false
                            ),
                            period: (
                                this.type !== Type.DATETIME
                                    ? period.clone().startOf('day').toDate()
                                    : (
                                        period.clone()
                                            .set({ hour: 12, minute: 0, second: 0 })
                                            .toDate()
                                    )
                            ),
                        };
                    })
                ));
            }

            return RANGE_SNIPPETS.map((snippetGroup: RawRangeSnippet[]): Snippet[] => (
                snippetGroup.map((snippet: RawRangeSnippet): Snippet => {
                    const { labelKey, period: periodFunc } = snippet;
                    const [currentStart, currentEnd] = this.normalizedValue as Value<true>;
                    const [periodStart, periodEnd] = periodFunc(moment(now));

                    let periodLabelParts: [string, string];
                    if (periodStart.isSame(periodEnd, 'year')) {
                        periodLabelParts = [
                            periodStart.format(__('range-format.same-year.start')),
                            periodEnd.format(__('range-format.same-year.end')),
                        ];
                    } else {
                        periodLabelParts = [
                            periodStart.format(__('range-format.full.start')),
                            periodEnd.format(__('range-format.full.end')),
                        ];
                    }

                    return {
                        label: __(labelKey),
                        periodLabel: periodLabelParts.join(' - '),
                        isActive: ((): boolean => {
                            if (currentStart === null || currentEnd === null) {
                                return false;
                            }

                            return (
                                periodStart.isSame(currentStart, 'day') &&
                                periodEnd.isSame(currentEnd, 'day')
                            );
                        })(),
                        period: (
                            [periodStart, periodEnd].map((date: Moment) => (
                                this.type !== Type.DATETIME
                                    ? date.clone().startOf('day').toDate()
                                    : (
                                        date.clone()
                                            .set({ hour: 12, minute: 0, second: 0 })
                                            .toDate()
                                    )
                            )) as [Date, Date]
                        ),
                    };
                })
            ));
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les 10 secondes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 10_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleInput(newValue: LooseValue) {
            const normalizedValue = normalizeValue(
                newValue,
                this.type,
                this.range,
                this.withoutMinutes,
            );

            if (this.withFullDaysToggle) {
                this.$emit('input', normalizedValue, this.isFullDays);
                this.$emit('change', normalizedValue, this.isFullDays);
            } else {
                this.$emit('input', normalizedValue);
                this.$emit('change', normalizedValue);
            }
        },

        handleToggleFullDays() {
            if (!this.withFullDaysToggle || this.inheritedDisabled) {
                return;
            }

            const newIsFullDays = !this.isFullDays;
            const newValue = normalizeValue(
                this.normalizedValue,
                newIsFullDays ? Type.DATE : Type.DATETIME,
                this.range,
                this.withoutMinutes,
            );

            this.$emit('input', newValue, newIsFullDays);
            this.$emit('change', newValue, newIsFullDays);
        },

        handleToggleMode() {
            if (this.type !== Type.DATETIME) {
                this.showTimePanel = false;
                return;
            }
            this.showTimePanel = !this.showTimePanel;
        },

        handleClose() {
            this.showTimePanel = false;
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `components.Datepicker.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            name,
            range,
            type,
            snippets,
            isFullDays,
            translations,
            normalizedValue: value,
            inheritedDisabled: disabled,
            inheritedInvalid: invalid,
            showTimePanel,
            displayFormat,
            outputFormat,
            dateFormat,
            placeholder,
            disabledDateFactory,
            withFullDaysToggle,
            withoutMinutes,
            withSnippets,
            timePickerOptions,
            handleToggleFullDays,
            handleToggleMode,
            handleInput,
            handleClose,
        } = this;

        const withHeader = withFullDaysToggle && !disabled;
        const renderHeader = (): JSX.Element | null => {
            if (!withHeader) {
                return null;
            }

            return (
                <div class="Datepicker__full-days">
                    <label class="Datepicker__full-days__label">
                        {range ? __('full-days') : __('full-day')}
                    </label>
                    <Switch
                        class="Datepicker__full-days__switch"
                        onInput={handleToggleFullDays}
                        value={isFullDays}
                    />
                </div>
            );
        };

        const withFooter = type === Type.DATETIME && !disabled;
        const renderFooter = (): JSX.Element | null => {
            if (!withFooter) {
                return null;
            }

            const message = showTimePanel
                ? (range ? __('select-dates') : __('select-date'))
                : (range ? __('select-hours') : __('select-hour'));

            return (
                <Button
                    class="Datepicker__toggle-mode"
                    icon={showTimePanel ? 'calendar' : 'clock'}
                    onClick={handleToggleMode}
                >
                    {message}
                </Button>
            );
        };

        const withSidebar = withSnippets && !disabled && snippets.length > 0;
        const renderSidebar = (changeDate: DatePickerEmit): JSX.Element | null => {
            if (!withSidebar) {
                return null;
            }

            return (
                <div class="Datepicker__snippets">
                    <div class="Datepicker__snippets__container">
                        {snippets.map((snippetGroup: Snippet[], index: number) => (
                            <dl key={index} class="Datepicker__snippets__group">
                                {snippetGroup.map((snippet: Snippet) => (
                                    <div
                                        key={`${index}-${snippet.label}`}
                                        onClick={() => { changeDate(snippet.period); }}
                                        class={['Datepicker__snippet', {
                                            'Datepicker__snippet--active': snippet.isActive,
                                        }]}
                                    >
                                        <dt class="Datepicker__snippet__label">{snippet.label}</dt>
                                        <dt class="Datepicker__snippet__value">{snippet.periodLabel}</dt>
                                    </div>
                                ))}
                            </dl>
                        ))}
                    </div>
                </div>
            );
        };

        const renderHiddenInput = (): JSX.Element | null => {
            if (!name || disabled) {
                return null;
            }

            const renderDates = (): JSX.Element => {
                if (range) {
                    const [start, end] = value as Value<true>;

                    return (
                        <Fragment>
                            <input type="hidden" name={`${name}[start]`} value={start ?? ''} />
                            <input type="hidden" name={`${name}[end]`} value={end ?? ''} />
                        </Fragment>
                    );
                }

                return <input type="hidden" name={name} value={(value as Value<false>) ?? ''} />;
            };

            return (
                <Fragment>
                    {renderDates()}
                    {withFullDaysToggle && (
                        <input
                            type="hidden"
                            name={`${name}[is_full_days]`}
                            value={this.isFullDays ? 1 : 0}
                        />
                    )}
                </Fragment>
            );
        };

        const className = ['Datepicker', {
            'Datepicker--invalid': invalid,
        }];

        return (
            <div class={className}>
                <CoreDatepicker
                    ref="picker"
                    class="Datepicker__input"
                    disabled={disabled}
                    type={type}
                    range={range}
                    lang={translations}
                    value={value}
                    minuteStep={MINUTES_STEP}
                    showMinute={!withoutMinutes}
                    showSecond={false}
                    clearable={false}
                    showTimeHeader={type === Type.DATETIME}
                    placeholder={placeholder}
                    formatter={FORMATTER}
                    format={displayFormat}
                    valueType={outputFormat}
                    titleFormat={dateFormat}
                    timeTitleFormat={dateFormat}
                    disabledDate={disabledDateFactory('day')}
                    disabledTime={disabledDateFactory('minute')}
                    showTimePanel={showTimePanel}
                    timePickerOptions={timePickerOptions}
                    rangeSeparator="  ⇒  "
                    confirmText={__('global.done')}
                    scopedSlots={{
                        ...(withHeader ? { header: () => renderHeader() } : {}),
                        ...(withFooter ? { footer: () => renderFooter() } : {}),
                        ...(withSidebar ? {
                            sidebar: ({ emit: changeDate }: DatePickerSlotParams) => (
                                renderSidebar(changeDate)
                            ),
                        } : {}),
                    }}
                    onClose={handleClose}
                    onInput={handleInput}
                />
                {renderHiddenInput()}
            </div>
        );
    },
});

export { Type };
export default Datepicker;
