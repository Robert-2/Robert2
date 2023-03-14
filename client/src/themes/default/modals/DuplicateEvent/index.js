import './index.scss';
import moment from 'moment';
import apiEvents from '@/stores/api/events';
import { DATE_DB_FORMAT } from '@/globals/constants';
import FormField from '@/themes/default/components/FormField';
import LocationText from '@/themes/default/components/LocationText';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import EventBeneficiaries from '@/themes/default/components/EventBeneficiaries';
import EventTechnicians from '@/themes/default/components/EventTechnicians';
import getEventMaterialItemsCount from '@/utils/getEventMaterialItemsCount';
import { ApiErrorCode } from '@/stores/api/@codes';

// @vue/component
export default {
    name: 'DuplicateEvent',
    modal: {
        width: 600,
        draggable: true,
        clickToClose: false,
    },
    provide: {
        verticalForm: true,
    },
    props: {
        event: { type: Object, required: true },
        onDuplicated: { type: Function, required: true },
    },
    data() {
        return {
            dates: [null, null],
            datepickerOptions: {
                disabled: { from: null, to: new Date() },
                range: true,
            },
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

        hasBeneficiary() {
            return this.event.beneficiaries?.length > 0;
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSave() {
            this.save();
        },

        handleClose() {
            this.$emit('close');
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async save() {
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
            const { event: { id } } = this;

            try {
                const { data } = await apiEvents.duplicate(id, {
                    start_date: moment(startDate).startOf('day').format(DATE_DB_FORMAT),
                    end_date: moment(endDate).endOf('day').format(DATE_DB_FORMAT),
                });

                this.validationErrors = null;

                const { onDuplicated } = this.$props;
                if (onDuplicated) {
                    onDuplicated(data);
                }

                this.$emit('close');
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                if (code === ApiErrorCode.VALIDATION_FAILED) {
                    this.validationErrors = { ...details };
                } else {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                }
                this.isSaving = false;
            }
        },
    },
    render() {
        const { title, location, beneficiaries, technicians } = this.event;
        const {
            $t: __,
            duration,
            itemsCount,
            hasBeneficiary,
            isSaving,
            validationErrors,
            datepickerOptions,
            handleSave,
            handleClose,
        } = this;

        return (
            <div class="DuplicateEvent">
                <div class="DuplicateEvent__header">
                    <h2 class="DuplicateEvent__header__title">
                        {__('duplicate-the-event', { title })}
                    </h2>
                    <Button
                        type="close"
                        class="DuplicateEvent__header__close-button"
                        onClick={handleClose}
                    />
                </div>
                <div class="DuplicateEvent__body">
                    <h4 class="DuplicateEvent__help">{__('dates-of-duplicated-event')}</h4>
                    <div class="DuplicateEvent__dates">
                        <FormField
                            v-model={this.dates}
                            type="date"
                            errors={validationErrors?.start_date || validationErrors?.end_date}
                            datepickerOptions={datepickerOptions}
                            placeholder="start-end-dates"
                            required
                        />
                    </div>
                    <div class="DuplicateEvent__infos">
                        <div class="DuplicateEvent__infos__duration">
                            <Icon name="clock" />{' '}
                            {duration ? __('duration-days', { duration }, duration) : `${__('duration')} ?`}
                        </div>
                        {location && <LocationText location={location} />}
                        {!hasBeneficiary && (
                            <p class="DuplicateEvent__infos__no-beneficiary">
                                <Icon name="address-book" class="DuplicateEvent__infos__no-beneficiary__icon" />
                                {__('@event.warning-no-beneficiary')}
                            </p>
                        )}
                        {hasBeneficiary && (
                            <EventBeneficiaries beneficiaries={beneficiaries} />
                        )}
                        <EventTechnicians eventTechnicians={technicians} />
                        <div class="DuplicateEvent__infos__items-count">
                            <Icon name="box" />{' '}
                            {__('items-count', { count: itemsCount }, itemsCount)}
                        </div>
                    </div>
                </div>
                <div class="DuplicateEvent__footer">
                    <Button type="primary" onClick={handleSave} loading={isSaving}>
                        {__('duplicate-event')}
                    </Button>
                    <Button onClick={handleClose}>
                        {__('cancel')}
                    </Button>
                </div>
            </div>
        );
    },
};
