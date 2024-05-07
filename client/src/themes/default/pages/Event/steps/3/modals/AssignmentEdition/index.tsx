import './index.scss';
import axios from 'axios';
import pick from 'lodash/pick';
import apiEvents from '@/stores/api/events';
import { confirm } from '@/utils/alert';
import { defineComponent } from '@vue/composition-api';
import { ApiErrorCode } from '@/stores/api/@codes';
import Button from '@/themes/default/components/Button';
import FormField from '@/themes/default/components/FormField';

import type Period from '@/utils/period';
import type DateTime from '@/utils/datetime';
import type { PropType } from '@vue/composition-api';
import type { DisableDateFunction } from '@/themes/default/components/DatePicker';
import type { EventDetails, EventTechnician, EventTechnicianEdit } from '@/stores/api/events';

type Props = {
    /** L'événement en cours d'édition. */
    event: EventDetails,

    /** L'assignation à éditer. */
    assignment: EventTechnician,
};

type Data = {
    data: EventTechnicianEdit,
    isSaving: boolean,
    isDeleting: boolean,
    validationErrors: Record<string, string[]> | null,
};

/**
 * Modale d'édition de l'assignation d'un technician à
 * l'étape 3 de l'édition d'un événement.
 */
const EventStep3AssignmentEdition = defineComponent({
    name: 'EventStep3AssignmentEdition',
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
        assignment: {
            type: Object as PropType<Props['assignment']>,
            required: true,
        },
    },
    emits: ['close'],
    data(): Data {
        const data: EventTechnicianEdit = pick(this.assignment, ['position', 'period']);

        return {
            data,
            isSaving: false,
            isDeleting: false,
            validationErrors: null,
        };
    },
    computed: {
        name(): string {
            return this.assignment.technician.full_name;
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

        handleDelete() {
            this.remove();
        },

        // ------------------------------------------------------
        // -
        // -    Methods
        // -
        // ------------------------------------------------------

        async save() {
            if (this.isSaving || this.isDeleting) {
                return;
            }
            this.isSaving = true;
            const { $t: __, data } = this;

            try {
                const updatedAssignment = await apiEvents.updateTechnicianAssignment(this.assignment.id, data);
                this.validationErrors = null;

                this.$toasted.success(__('page.event-edit.steps.technicians.assignation-saved'));
                this.$emit('close', updatedAssignment);
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

        async remove() {
            if (this.isDeleting || this.isSaving) {
                return;
            }
            this.isDeleting = true;
            const { $t: __ } = this;

            const isConfirmed = await confirm({
                type: 'danger',
                text: __('page.event-edit.technician-item.confirm-permanently-delete'),
                confirmButtonText: __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                this.isDeleting = false;
                return;
            }

            try {
                await apiEvents.deleteTechnicianAssignment(this.assignment.id);

                this.$toasted.success(__('page.event-edit.steps.technicians.assignation-removed'));
                this.$emit('close', null);
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
                this.isDeleting = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            name,
            data,
            isSaving,
            isDeleting,
            validationErrors,
            disabledDateFactory,
            handleSubmit,
            handleClose,
            handleDelete,
        } = this;

        return (
            <div class="EventStep3AssignmentEdition">
                <header class="EventStep3AssignmentEdition__header">
                    <h2 class="EventStep3AssignmentEdition__header__title">
                        {__('page.event-edit.assign-technician', { name })}
                    </h2>
                    <Button
                        type="close"
                        class="EventStep3AssignmentEdition__header__close-button"
                        onClick={handleClose}
                    />
                </header>
                <div class="EventStep3AssignmentEdition__body">
                    <form class="Form EventStep3AssignmentEdition__form" onSubmit={handleSubmit}>
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
                <div class="EventStep3AssignmentEdition__footer">
                    <Button type="primary" loading={isSaving} onClick={handleSubmit}>
                        {isSaving ? __('saving') : __('page.event-edit.modify-assignment')}
                    </Button>
                    <Button type="delete" loading={isDeleting} onClick={handleDelete}>
                        {isDeleting ? __('deleting') : __('page.event-edit.remove-assignment')}
                    </Button>
                </div>
            </div>
        );
    },
});

export default EventStep3AssignmentEdition;
