import './index.scss';
import moment from 'moment';
import { DATE_DB_FORMAT } from '@/globals/constants';
import FormField from '@/themes/default/components/FormField';
import LocationText from '@/themes/default/components/LocationText';
import EventBeneficiaries from '@/themes/default/components/EventBeneficiaries';
import EventTechnicians from '@/themes/default/components/EventTechnicians';
import getEventMaterialItemsCount from '@/utils/getEventMaterialItemsCount';

// @vue/component
export default {
    name: 'DuplicateEvent',
    provide: {
        verticalForm: true,
    },
    props: {
        event: Object,
        onDuplicated: Function,
    },
    data() {
        return {
            dates: [null, null],
            datepickerOptions: {
                disabled: { from: null, to: new Date() },
                range: true,
            },
            error: null,
            validationErrors: null,
            isSaving: false,
        };
    },
    computed: {
        duration() {
            const [startDate, endDate] = this.dates;
            if (!startDate || !endDate) {
                return null;
            }
            return moment(endDate).diff(startDate, 'days') + 1;
        },

        itemsCount() {
            return getEventMaterialItemsCount(this.event.materials);
        },
    },
    methods: {
        async handleSubmit() {
            if (this.isSaving) {
                return;
            }

            const { $t: __, dates } = this;
            const [startDate, endDate] = dates;
            if (!startDate || !endDate) {
                this.validationErrors = {
                    start_date: [__('please-choose-dates')],
                };
                return;
            }

            this.isSaving = true;
            this.error = false;
            this.validationErrors = false;

            const { id: userId } = this.$store.state.auth.user;

            const newEventData = {
                user_id: userId,
                start_date: moment(startDate).startOf('day').format(DATE_DB_FORMAT),
                end_date: moment(endDate).endOf('day').format(DATE_DB_FORMAT),
            };

            try {
                const url = `events/${this.event.id}/duplicate`;
                const { data } = await this.$http.post(url, newEventData);

                const { onDuplicated } = this.$props;
                if (onDuplicated) {
                    onDuplicated(data);
                }

                this.$emit('close');
            } catch (error) {
                this.error = error;

                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.validationErrors = { ...details };
                }
            } finally {
                this.isSaving = false;
            }
        },

        handleClose() {
            this.$emit('close');
        },
    },
    render() {
        const {
            $t: __,
            duration,
            itemsCount,
            error,
            validationErrors,
            datepickerOptions,
            handleSubmit,
            handleClose,
        } = this;

        const { title, location, beneficiaries, technicians } = this.event;

        return (
            <div class="DuplicateEvent">
                <div class="DuplicateEvent__header">
                    <h2 class="DuplicateEvent__header__title">
                        {__('duplicate-the-event', { title })}
                    </h2>
                    <button type="button" class="DuplicateEvent__header__btn-close" onClick={handleClose}>
                        <i class="fas fa-times" />
                    </button>
                </div>
                <div class="DuplicateEvent__main">
                    <h4 class="DuplicateEvent__main__help">{__('dates-of-duplicated-event')}</h4>
                    <div class="DuplicateEvent__main__dates">
                        <FormField
                            v-model={this.dates}
                            type="date"
                            errors={validationErrors?.start_date || validationErrors?.end_date}
                            datepickerOptions={datepickerOptions}
                            placeholder="start-end-dates"
                            required
                        />
                    </div>
                    <div class="DuplicateEvent__main__infos">
                        <div class="DuplicateEvent__main__infos__duration">
                            <i class="fas fa-clock" />{' '}
                            {duration ? __('duration-days', { duration }, duration) : `${__('duration')} ?`}
                        </div>
                        {location && <LocationText location={location} />}
                        <EventBeneficiaries
                            beneficiaries={beneficiaries}
                            warningEmptyText={__('@event.warning-no-beneficiary')}
                        />
                        <EventTechnicians eventTechnicians={technicians} />
                        <div class="DuplicateEvent__main__infos__items-count">
                            <i class="fas fa-box" />{' '}
                            {__('items-count', { count: itemsCount }, itemsCount)}
                        </div>
                    </div>
                    {error && (
                        <p class="DuplicateEvent__main__error">
                            <i class="fas fa-exclamation-triangle" /> {error.message}
                        </p>
                    )}
                </div>
                <hr class="DuplicateEvent__separator" />
                <div class="DuplicateEvent__footer">
                    <button type="button" onClick={handleSubmit} class="success">
                        <i class="fas fa-check" /> {__('duplicate-event')}
                    </button>
                    <button type="button" onClick={handleClose}>
                        <i class="fas fa-times" /> {__('close')}
                    </button>
                </div>
            </div>
        );
    },
};
