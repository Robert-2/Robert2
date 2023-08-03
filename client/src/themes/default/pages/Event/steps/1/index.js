import './index.scss';
import { defineComponent } from '@vue/composition-api';
import moment from 'moment';
import pick from 'lodash/pick';
import config from '@/globals/config';
import { DATE_DB_FORMAT } from '@/globals/constants';
import apiEvents from '@/stores/api/events';
import FormField from '@/themes/default/components/FormField';
import Fieldset from '@/themes/default/components/Fieldset';
import { ApiErrorCode } from '@/stores/api/@codes';
import getCSSProperty from '@/utils/getCSSProperty';
import EventStore from '../../EventStore';

const DEFAULT_VALUES = Object.freeze({
    title: '',
    start_date: null,
    end_date: null,
    location: '',
    description: '',
    color: null,
    is_billable: config.billingMode !== 'none',
    is_confirmed: false,
});

// @vue/component
const EventStep1 = defineComponent({
    name: 'EventStep1',
    provide: {
        verticalForm: true,
    },
    props: {
        event: { type: Object, required: true },
    },
    emits: ['loading', 'updateEvent', 'gotoStep', 'error', 'stopLoading'],
    data() {
        return {
            data: {
                ...DEFAULT_VALUES,
                ...pick(this.event ?? {}, Object.keys(DEFAULT_VALUES)),
            },
            errors: null,
        };
    },
    computed: {
        isNew() {
            return this.event.id === null;
        },

        allowBillingToggling() {
            return config.billingMode === 'partial';
        },

        dates() {
            const { data } = this;

            if (!data.start_date || !data.end_date) {
                return null;
            }

            return [data.start_date, data.end_date];
        },

        duration() {
            const [startDate, endDate] = this.dates ?? [null, null];
            if (!startDate || !endDate) {
                return 0;
            }
            return moment(endDate).diff(startDate, 'days') + 1;
        },

        defaultColor() {
            return getCSSProperty('calendar-event-default-color');
        },

        datepickerOptions: () => ({
            range: true,
            disabled: { from: null, to: null },
        }),
    },
    watch: {
        event() {
            this.setValuesFromEvent();
            this.checkIsSavedEvent();
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleBasicChange() {
            this.checkIsSavedEvent();
        },

        handleDatesChange([startDate, endDate]) {
            this.data.start_date = startDate;
            this.data.end_date = endDate;
            this.checkIsSavedEvent();
        },

        handleSubmit(e) {
            e.preventDefault();

            this.save();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        setValuesFromEvent() {
            if (!this.event) {
                return;
            }

            this.data = {
                ...DEFAULT_VALUES,
                ...this.data,
                ...pick(this.event ?? {}, Object.keys(DEFAULT_VALUES)),
            };
        },

        checkIsSavedEvent() {
            EventStore.dispatch('checkIsSaved', { ...this.event, ...this.data });
        },

        async save() {
            this.$emit('loading');
            const { isNew } = this;

            const postData = {
                ...this.data,
                start_date: moment(this.data.start_date).startOf('day').format(DATE_DB_FORMAT),
                end_date: moment(this.data.end_date).endOf('day').format(DATE_DB_FORMAT),
            };

            const doRequest = () => (
                isNew
                    ? apiEvents.create(postData)
                    : apiEvents.update(this.event.id, postData)
            );

            try {
                const data = await doRequest();
                EventStore.commit('setIsSaved', true);
                this.$emit('updateEvent', data);
                this.$emit('gotoStep', 2);
            } catch (error) {
                this.$emit('error', error);

                const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                if (code === ApiErrorCode.VALIDATION_FAILED) {
                    this.errors = { ...details };
                }
            } finally {
                this.$emit('stopLoading');
            }
        },
    },
    render() {
        const {
            $t: __,
            duration,
            dates,
            data,
            errors,
            defaultColor,
            datepickerOptions,
            allowBillingToggling,
            handleBasicChange,
            handleDatesChange,
            handleSubmit,
        } = this;

        return (
            <form class="EventStep1" method="POST" onSubmit={handleSubmit}>
                <Fieldset>
                    <FormField
                        label="title"
                        v-model={data.title}
                        onInput={handleBasicChange}
                        errors={errors?.title}
                        required
                    />
                    <div class="EventStep1__dates">
                        <div class="EventStep1__dates__fields">
                            <FormField
                                label="dates"
                                type="date"
                                value={dates}
                                datepickerOptions={datepickerOptions}
                                errors={errors?.start_date || errors?.end_date}
                                onChange={handleDatesChange}
                                required
                            />
                        </div>
                        <div class="EventStep1__dates__duration">
                            {duration > 0 && __('duration-days', { duration }, duration)}
                        </div>
                    </div>
                </Fieldset>
                <Fieldset title={__('event-details')}>
                    <FormField
                        label="location"
                        v-model={data.location}
                        class="EventStep1__location"
                        onInput={handleBasicChange}
                        errors={errors?.location}
                    />
                    <FormField
                        label="description"
                        type="textarea"
                        v-model={data.description}
                        class="EventStep1__description"
                        onInput={handleBasicChange}
                        errors={errors?.description}
                    />
                    {allowBillingToggling && (
                        <div class="EventStep1__is-billable">
                            <FormField
                                label="is-billable"
                                type="switch"
                                v-model={data.is_billable}
                                class="EventStep1__is-billable__input"
                                onChange={handleBasicChange}
                                errors={errors?.is_billable}
                            />
                            <div class="EventStep1__is-billable__help">
                                <i class="fas fa-arrow-right" />&nbsp;
                                {data.is_billable && __(`is-billable-help`)}
                                {!data.is_billable && __(`is-not-billable-help`)}
                            </div>
                        </div>
                    )}
                </Fieldset>
                <Fieldset title={__('customization')}>
                    <FormField
                        label="color-on-calendar"
                        type="color"
                        v-model={data.color}
                        class="EventStep1__color"
                        placeholder={defaultColor}
                        onChange={handleBasicChange}
                        errors={errors?.color}
                    />
                </Fieldset>
                <section class="EventStep1__actions">
                    <button type="submit" class="button success">
                        {__('page.event-edit.save-and-go-to-next-step')}&nbsp;
                        <i class="fas fa-arrow-right" />
                    </button>
                </section>
            </form>
        );
    },
});

export default EventStep1;
