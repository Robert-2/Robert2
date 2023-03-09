import './index.scss';
import moment from 'moment';
import { TECHNICIAN_EVENT_MIN_DURATION, DATE_DB_FORMAT } from '@/globals/constants';
import { confirm } from '@/utils/alert';
import { getValidationErrors } from '@/utils/errors';
import FormField from '@/themes/default/components/FormField';
import ErrorMessage from '@/themes/default/components/ErrorMessage';

// @vue/component
export default {
    name: 'EventStep3Modal',
    modal: {
        width: 600,
        clickToClose: false,
    },
    provide: {
        verticalForm: true,
    },
    props: {
        eventDates: { type: Object, required: true },
        data: {
            required: true,
            validator(value) {
                if (!['object', 'number'].includes(typeof value)) {
                    return false;
                }

                // -> Édition : Id du TechnicianEvent passé directement
                if (typeof value === 'number') {
                    return true;
                }

                // -> Création : Données de base
                const dataRequirements = {
                    eventId: { type: Number, required: true },
                    technician: { type: Object, required: true },
                    startTime: { type: String },
                };
                return !Object.entries(dataRequirements).some(
                    ([field, { type, required = false }]) => (
                        !(field in value) ||
                        (required && value[field] === undefined) ||
                        (value[field] !== undefined && value[field].constructor !== type)
                    ),
                );
            },
        },
    },
    data() {
        const { data } = this.$props;

        const baseData = {
            position: '',
            isLoading: false,
            isSaving: false,
            isDeleting: false,
            error: null,
            validationErrors: null,
            isNew: false,
            eventId: null,
            technician: null,
            dates: [null, null],
        };

        if (typeof data === 'number') {
            return baseData;
        }

        const startDate = data.startTime;
        const endDate = moment(data.startTime)
            .add(TECHNICIAN_EVENT_MIN_DURATION)
            .format('YYYY-MM-DD HH:mm');

        return {
            ...baseData,
            isNew: true,
            eventId: data.eventId,
            technician: data.technician,
            dates: [startDate, endDate],
        };
    },
    computed: {
        name() {
            return this.technician?.full_name || null;
        },

        datePickerOptions() {
            const { start, end } = this.$props.eventDates;

            return {
                range: true,
                disabled: { notBetween: [start, end] },
            };
        },

        saveButtonText() {
            const { $t: __, isNew, name } = this;

            return isNew
                ? __('page.event-edit.assign-name', { name })
                : __('page.event-edit.modify-assignment');
        },
    },
    mounted() {
        if (typeof this.$props.data === 'number') {
            this.fetchTechnicianEvent();
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e) {
            e.preventDefault();
            this.save();
        },

        handleClose() {
            this.$emit('close');
        },

        handleDelete() {
            this.remove();
        },

        // ------------------------------------------------------
        // -
        // -    Methods
        // -
        // ------------------------------------------------------

        async fetchTechnicianEvent() {
            if (typeof this.$props.data !== 'number') {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                const { data: eventTechnicianId } = this.$props;
                const { data } = await this.$http.get(`event-technicians/${eventTechnicianId}`);

                const startDate = moment.utc(data.start_time)
                    .local()
                    .format('YYYY-MM-DD HH:mm');

                const endDate = moment.utc(data.end_time)
                    .local()
                    .format('YYYY-MM-DD HH:mm');

                this.eventId = data.event_id;
                this.position = data.position;
                this.technician = data.technician;
                this.dates = [startDate, endDate];
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        async save() {
            if (this.isSaving || this.isDeleting) {
                return;
            }

            this.error = null;
            this.isSaving = true;

            const { position, eventId, technician } = this;
            const [startDate, endDate] = this.dates;

            const postData = {
                event_id: eventId,
                technician_id: technician.id,
                start_time: moment(startDate).utc().format(DATE_DB_FORMAT),
                end_time: moment(endDate).utc().format(DATE_DB_FORMAT),
                position,
            };

            let url = 'event-technicians';
            if (typeof this.$props.data === 'number') {
                const { data: eventTechnicianId } = this.$props;
                url = `event-technicians/${eventTechnicianId}`;
            }

            const request = this.isNew ? this.$http.post : this.$http.put;

            try {
                await request(url, postData);
                this.$emit('close');
            } catch (error) {
                this.error = error;
                this.validationErrors = getValidationErrors(error);
            } finally {
                this.isSaving = false;
            }
        },

        async remove() {
            if (this.isDeleting || this.isSaving || this.isNew) {
                return;
            }

            const { $t: __ } = this;
            const isConfirmed = await confirm({
                text: __('page.event-edit.technician-item.confirm-permanently-delete'),
                confirmButtonText: __('yes-permanently-delete'),
                type: 'danger',
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isDeleting = true;

            const { data: eventTechnicianId } = this.$props;

            try {
                await this.$http.delete(`event-technicians/${eventTechnicianId}`);
                this.$emit('close');
            } catch (error) {
                this.error = error;
            } finally {
                this.isDeleting = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            name,
            isNew,
            saveButtonText,
            isSaving,
            isDeleting,
            error,
            validationErrors,
            datePickerOptions,
            handleSubmit,
            handleClose,
            handleDelete,
        } = this;

        return (
            <div class="EventStep3Modal">
                <header class="EventStep3Modal__header">
                    <h1 class="EventStep3Modal__header__title">
                        {__('page.event-edit.assign-technician', { name })}
                    </h1>
                    <button type="button" class="close" onClick={handleClose}>
                        <i class="fas fa-times" />
                    </button>
                </header>
                <div class="EventStep3Modal__body">
                    <form class="Form EventStep3Modal__form" onSubmit={handleSubmit}>
                        <FormField
                            type="datetime"
                            v-model={this.dates}
                            label={__('page.event-edit.period-assigned')}
                            placeholder={__('page.event-edit.start-end-dates-and-time')}
                            datepickerOptions={datePickerOptions}
                            errors={validationErrors?.start_time || validationErrors?.end_time}
                        />
                        <FormField
                            v-model={this.position}
                            label={`${__('position-held')} (${__('optional')})`}
                            errors={validationErrors?.position}
                        />
                        {error && <ErrorMessage error={error} />}
                        <div class="EventStep3Modal__actions">
                            <button type="submit" class="success" disabled={isSaving}>
                                {isSaving ? <i class="fas fa-circle-notch fa-spin" /> : <i class="fas fa-check" />}{' '}
                                {isSaving ? __('saving') : saveButtonText}
                            </button>
                            {!isNew && (
                                <button type="button" class="danger EventStep3Modal__delete" onClick={handleDelete}>
                                    {isDeleting ? <i class="fas fa-circle-notch fa-spin" /> : <i class="fas fa-trash" />}{' '}
                                    {isDeleting ? __('deleting') : __('page.event-edit.remove-assignment')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    },
};
