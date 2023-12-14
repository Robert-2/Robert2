import './index.scss';
import axios from 'axios';
import moment from 'moment';
import { confirm } from '@/utils/alert';
import apiEvents from '@/stores/api/events';
import { DATE_DB_FORMAT } from '@/globals/constants';
import FormField from '@/themes/default/components/FormField';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import EventBeneficiaries from '@/themes/default/components/EventBeneficiaries';
import EventTechnicians from '@/themes/default/components/EventTechnicians';
import { ApiErrorCode } from '@/stores/api/@codes';
import { defineComponent } from '@vue/composition-api';
import computeFullDurations from '@/utils/computeFullDurations';

import type { PropType } from '@vue/composition-api';
import type { Duration } from '@/utils/computeFullDurations';
import type { Event, EventMaterial } from '@/stores/api/events';

type Props = {
    /** L'événement à dupliquer. */
    event: Event,
};

type Data = {
    isSaving: boolean,
    dates: [start: string | null, end: string | null],
    validationErrors: Record<string, string[]> | undefined,
};

/** Modale de duplication d'un événement. */
const DuplicateEvent = defineComponent({
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
        event: {
            type: Object as PropType<Props['event']>,
            required: true,
        },
    },
    data: (): Data => ({
        dates: [null, null],
        isSaving: false,
        validationErrors: undefined,
    }),
    computed: {
        duration(): Duration | null {
            const [start, end] = this.dates;
            return start && end
                ? computeFullDurations(start, end)
                : null;
        },

        itemsCount(): number {
            const { materials } = this.event;

            return materials.reduce(
                (total: number, material: EventMaterial) => (
                    total + material.pivot.quantity
                ),
                0,
            );
        },

        hasBeneficiary(): boolean {
            return this.event.beneficiaries?.length > 0;
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e: SubmitEvent) {
            e?.preventDefault();

            this.save();
        },

        handleClose() {
            this.$emit('close');
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async save(force: boolean = false) {
            if (this.isSaving) {
                return;
            }

            const { __, dates } = this;
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
                const period = {
                    start_date: moment(startDate).startOf('day').format(DATE_DB_FORMAT),
                    end_date: moment(endDate).endOf('day').format(DATE_DB_FORMAT),
                };
                const newEvent = await apiEvents.duplicate(id, period, force);

                this.$toasted.success(__('new-event-saved'));
                this.validationErrors = undefined;
                this.$emit('close', newEvent);
            } catch (error) {
                this.isSaving = false;

                if (axios.isAxiosError(error)) {
                    const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.validationErrors = { ...details };
                        return;
                    }
                    if (code === ApiErrorCode.TECHNICIAN_ALREADY_BUSY) {
                        const shouldForceDuplicate = await confirm({
                            type: 'warning',
                            text: __('technician-already-busy-force'),
                            confirmButtonText: __('force-duplicate'),
                        });
                        if (shouldForceDuplicate) {
                            this.save(true);
                        }
                        return;
                    }
                }
                this.$toasted.error(__('global.errors.unexpected-while-saving'));
            }
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `modal.duplicate-event.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const { title, location, beneficiaries, technicians } = this.event;
        const {
            __,
            duration,
            itemsCount,
            hasBeneficiary,
            isSaving,
            validationErrors,
            handleClose,
            handleSubmit,
        } = this;

        return (
            <div class="DuplicateEvent">
                <div class="DuplicateEvent__header">
                    <h2 class="DuplicateEvent__header__title">
                        {__('title', { title })}
                    </h2>
                    <Button
                        type="close"
                        class="DuplicateEvent__header__close-button"
                        onClick={handleClose}
                    />
                </div>
                <div class="DuplicateEvent__body">
                    <h4 class="DuplicateEvent__help">{__('dates-of-duplicated-event')}</h4>
                    <form class="DuplicateEvent__dates" onSubmit={handleSubmit}>
                        <FormField
                            type="date"
                            v-model={this.dates}
                            errors={validationErrors?.start_date || validationErrors?.end_date}
                            placeholder="start-end-dates"
                            minDate="now"
                            required
                            range
                        />
                    </form>
                    <div class="DuplicateEvent__infos">
                        <div class="DuplicateEvent__infos__item">
                            <Icon name="clock" class="DuplicateEvent__infos__item__icon" />
                            <span class="DuplicateEvent__infos__item__content">
                                {(
                                    duration !== null
                                        ? __('global.duration-days', { duration: duration.days }, duration.days)
                                        : `${__('global.duration')} ?`
                                )}
                            </span>
                        </div>
                        {location && (
                            <div class="DuplicateEvent__infos__item">
                                <Icon name="map-marker-alt" class="DuplicateEvent__infos__item__icon" />
                                <span class="DuplicateEvent__infos__item__content">
                                    {__('global.in', { location })}
                                </span>
                            </div>
                        )}
                        {!hasBeneficiary && (
                            <div class="DuplicateEvent__infos__item DuplicateEvent__infos__item--empty">
                                <Icon name="address-book" class="DuplicateEvent__infos__item__icon" />
                                <span class="DuplicateEvent__infos__item__content">
                                    {__('global.@event.warning-no-beneficiary')}
                                </span>
                            </div>
                        )}
                        {hasBeneficiary && (
                            <EventBeneficiaries
                                class="DuplicateEvent__infos__item"
                                beneficiaries={beneficiaries}
                            />
                        )}
                        {technicians.length > 0 && (
                            <EventTechnicians
                                class="DuplicateEvent__infos__item"
                                eventTechnicians={technicians}
                            />
                        )}
                        <div class="DuplicateEvent__infos__item">
                            <Icon name="box" class="DuplicateEvent__infos__item__icon" />
                            <span class="DuplicateEvent__infos__item__content">
                                {__('global.items-count', { count: itemsCount }, itemsCount)}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="DuplicateEvent__footer">
                    <Button type="primary" onClick={handleSubmit} loading={isSaving}>
                        {__('global.duplicate-event')}
                    </Button>
                    <Button onClick={handleClose}>
                        {__('global.cancel')}
                    </Button>
                </div>
            </div>
        );
    },
});

export default DuplicateEvent;
