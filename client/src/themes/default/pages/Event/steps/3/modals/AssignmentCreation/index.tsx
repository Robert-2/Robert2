import './index.scss';
import axios from 'axios';
import Period from '@/utils/period';
import DateTime from '@/utils/datetime';
import apiEvents from '@/stores/api/events';
import { defineComponent } from '@vue/composition-api';
import { ApiErrorCode } from '@/stores/api/@codes';
import Button from '@/themes/default/components/Button';
import FormField from '@/themes/default/components/FormField';
import { MIN_TECHNICIAN_ASSIGNMENT_DURATION } from '@/globals/constants';

import type { PropType } from '@vue/composition-api';
import type { TechnicianWithEvents } from '@/stores/api/technicians';
import type { DisableDateFunction } from '@/themes/default/components/DatePicker';
import type { EventDetails, EventTechnicianEdit } from '@/stores/api/events';

type Props = {
    /** L'événement en cours d'édition. */
    event: EventDetails,

    /** Le technicien que l'on souhaite assigner à l'événement. */
    technician: TechnicianWithEvents,

    /** La date de début d'assignation à utiliser par défaut (si disponible). */
    defaultStartDate?: DateTime,
};

type Data = {
    data: EventTechnicianEdit,
    isSaving: boolean,
    validationErrors: Record<string, string[]> | null,
};

/**
 * Modale d'édition de création d'une assignation d'un technician
 * à l'étape 3 de l'édition d'un événement.
 */
const EventStep3AssignmentCreation = defineComponent({
    name: 'EventStep3AssignmentCreation',
    modal: {
        width: 600,
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
        technician: {
            type: Object as PropType<Props['technician']>,
            required: true,
        },
        defaultStartDate: {
            type: DateTime as PropType<Props['defaultStartDate']>,
            default: undefined,
        },
    },
    emits: ['close'],
    data(): Data {
        const data: EventTechnicianEdit = {
            position: null,
            period: this.defaultStartDate !== undefined
                ? new Period(
                    this.defaultStartDate,
                    this.defaultStartDate.add(MIN_TECHNICIAN_ASSIGNMENT_DURATION),
                )
                : null,
        };

        return {
            data,
            isSaving: false,
            validationErrors: null,
        };
    },
    computed: {
        name(): string {
            return this.technician.full_name;
        },

        assignationPeriod(): Period<false> {
            return this.event.mobilization_period
                .merge(this.event.operation_period)
                .setFullDays(false);
        },

        disabledDateFactory(): DisableDateFunction {
            const { assignationPeriod } = this;

            return (date: DateTime, granularity: 'day' | 'minute'): boolean => (
                // - Si la date est avant le début de la période d'assignation => Désactivée.
                date.isBefore(assignationPeriod.start, granularity) ||

                // - Si la date est après la fin de la période d'assignation => Désactivée.
                date.isAfter(assignationPeriod.end, granularity)
            );
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
            this.$emit('close', undefined);
        },

        // ------------------------------------------------------
        // -
        // -    Methods
        // -
        // ------------------------------------------------------

        async save() {
            if (this.isSaving) {
                return;
            }
            this.isSaving = true;
            const { $t: __, event, technician, data } = this;

            try {
                const eventTechnician = await apiEvents.addTechnicianAssignment(event.id, technician.id, data);
                this.validationErrors = null;

                this.$toasted.success(__('page.event-edit.steps.technicians.assignation-saved'));
                this.$emit('close', eventTechnician);
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while saving the company`, error);
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                } else {
                    const { code = ApiErrorCode.UNKNOWN, details = {} } = error.response?.data?.error ?? {};
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.validationErrors = { ...details };
                    } else {
                        this.$toasted.error(__('errors.unexpected-while-saving'));
                    }
                }
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            name,
            data,
            isSaving,
            validationErrors,
            disabledDateFactory,
            handleSubmit,
            handleClose,
        } = this;

        return (
            <div class="EventStep3AssignmentCreation">
                <header class="EventStep3AssignmentCreation__header">
                    <h2 class="EventStep3AssignmentCreation__header__title">
                        {__('page.event-edit.assign-technician', { name })}
                    </h2>
                    <Button
                        type="close"
                        class="EventStep3AssignmentCreation__header__close-button"
                        onClick={handleClose}
                    />
                </header>
                <div class="EventStep3AssignmentCreation__body">
                    <form class="EventStep3AssignmentCreation__form" onSubmit={handleSubmit}>
                        <FormField
                            type="datetime"
                            v-model={data.period}
                            label={__('page.event-edit.period-assigned')}
                            placeholder={__('page.event-edit.start-end-dates-and-time')}
                            errors={validationErrors?.period}
                            disabledDate={disabledDateFactory}
                            range
                        />
                        <FormField
                            v-model={data.position}
                            label={`${__('position-held')} (${__('optional')})`}
                            errors={validationErrors?.position}
                        />
                    </form>
                </div>
                <div class="EventStep3AssignmentCreation__footer">
                    <Button type="primary" onClick={handleSubmit} loading={isSaving}>
                        {isSaving ? __('saving') : __('page.event-edit.assign-name', { name })}
                    </Button>
                </div>
            </div>
        );
    },
});

export default EventStep3AssignmentCreation;
