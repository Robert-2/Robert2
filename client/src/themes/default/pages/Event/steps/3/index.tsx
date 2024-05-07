import './index.scss';
import axios from 'axios';
import Period, { PeriodReadableFormat } from '@/utils/period';
import DateTime from '@/utils/datetime';
import { confirm } from '@/utils/alert';
import showModal from '@/utils/showModal';
import apiEvents from '@/stores/api/events';
import apiTechnicians from '@/stores/api/technicians';
import { defineComponent } from '@vue/composition-api';
import stringIncludes from '@/utils/stringIncludes';
import { ApiErrorCode } from '@/stores/api/@codes';
import CriticalError from '@/themes/default/components/CriticalError';
import Help from '@/themes/default/components/Help';
import Loading from '@/themes/default/components/Loading';
import Timeline from '@/themes/default/components/Timeline';
import { MIN_TECHNICIAN_ASSIGNMENT_DURATION } from '@/globals/constants';
import Button from '@/themes/default/components/Button';
import Input from '@/themes/default/components/Input';

// - Modales
import AssignmentCreation from './modals/AssignmentCreation';
import AssignmentEdition from './modals/AssignmentEdition';

import type { PropType } from '@vue/composition-api';
import type { TechnicianWithEvents, TechnicianEvent } from '@/stores/api/technicians';
import type { EventDetails, EventTechnician } from '@/stores/api/events';
import type {
    TimelineItem,
    TimelineGroup,
    TimelineClickEvent,
    TimelineItemIdentifier,
    TimelineConfirmCallback,
} from '@/themes/default/components/Timeline';

type Props = {
    /** L'événement en cours d'édition. */
    event: EventDetails,
};

type Data = {
    technicians: TechnicianWithEvents[],
    searchTerm: string,
    isFetched: boolean,
    isLoading: boolean,
    hasCriticalError: boolean,
};

/**
 * Longueur minimale du texte lors d'une recherche
 * de technicien.
 */
const MIN_SEARCH_CHARACTERS = 2;

/**
 * Intervalle de temps minimum affiché dans la timeline.
 * (Il ne sera pas possible d'augmenter le zoom au delà de cette limite)
 */
const MIN_ZOOM = DateTime.duration(1, 'hour');

/** Étape 4 de l'edition d'un événement: Assignation des techniciens. */
const EventStep3 = defineComponent({
    name: 'EventStep3',
    props: {
        event: {
            type: Object as PropType<Props['event']>,
            required: true,
        },
    },
    emits: ['goToStep', 'updateEvent'],
    data: (): Data => ({
        technicians: [],
        searchTerm: '',
        isFetched: false,
        isLoading: false,
        hasCriticalError: false,
    }),
    computed: {
        assignationPeriod(): Period<false> {
            return this.event.mobilization_period
                .merge(this.event.operation_period)
                .setFullDays(false);
        },

        filteredTechnicians(): TechnicianWithEvents[] {
            const { technicians } = this;
            if (technicians.length === 0) {
                return [];
            }

            const query = this.searchTerm.trim();
            if (query.length < MIN_SEARCH_CHARACTERS) {
                return technicians;
            }

            return technicians.filter((technician: TechnicianWithEvents): boolean => (
                stringIncludes(technician.full_name, query) ||
                (!!technician.nickname && stringIncludes(technician.nickname, query)) ||
                (!!technician.email && stringIncludes(technician.email, query))
            ));
        },

        hasAssignableTechnicians(): boolean {
            return this.technicians.length > 0;
        },

        hasFilteredTechnicians(): boolean {
            return this.filteredTechnicians.length > 0;
        },

        groups(): TimelineGroup[] {
            return this.filteredTechnicians.map((technician: TechnicianWithEvents) => (
                { id: technician.id, name: technician.full_name }
            ));
        },

        assignments(): TimelineItem[] {
            const { $t: __, event } = this;

            const eventSlots: TimelineItem[] = event.technicians.map((assignment: EventTechnician) => {
                const eventInfos = (event.location ?? '').length > 0
                    ? `${event.title} (${event.location!})`
                    : event.title;

                const formattedPeriod = assignment.period.toReadable(__, PeriodReadableFormat.MINIMALIST);
                const assignmentInfos = (assignment.position ?? '').length > 0
                    ? `${formattedPeriod}: ${assignment.position!}`
                    : formattedPeriod;

                return {
                    id: assignment.id,
                    summary: assignmentInfos,
                    tooltip: `${eventInfos}\n${assignmentInfos}`,
                    period: assignment.period,
                    group: assignment.technician.id,
                    type: 'range',
                    editable: true,
                };
            });

            const otherSlots: TimelineItem[] = this.technicians.flatMap((technician: TechnicianWithEvents) => (
                technician.events.map((assignment: TechnicianEvent) => {
                    const eventInfos = (assignment.event.location ?? '').length > 0
                        ? `${assignment.event.title} (${assignment.event.location!})`
                        : assignment.event.title;

                    const formattedPeriod = assignment.period.toReadable(__, PeriodReadableFormat.MINIMALIST);
                    const assignmentInfos = (assignment.position ?? '').length > 0
                        ? `${formattedPeriod}: ${assignment.position!}`
                        : formattedPeriod;

                    return {
                        id: assignment.id,
                        summary: `${eventInfos}\n${assignmentInfos}`,
                        period: assignment.period,
                        group: technician.id,
                        type: 'background',
                        editable: false,
                    };
                })
            ));

            return [...eventSlots, ...otherSlots];
        },
    },
    mounted() {
        this.fetchAllTechnicians();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSearchChange(rawSearch: string) {
            this.searchTerm = rawSearch;
        },

        handleClickClearSearch() {
            this.searchTerm = '';
        },

        async handleCreateAssignment(technician: TechnicianWithEvents, date?: DateTime) {
            await showModal(this.$modal, AssignmentCreation, {
                technician,
                event: this.event,
                defaultStartDate: date,
            });

            this.updateEvent();
        },

        async handleUpdateAssignment(assignment: EventTechnician) {
            await showModal(this.$modal, AssignmentEdition, {
                assignment,
                event: this.event,
            });

            this.updateEvent();
        },

        handleTimelineDoubleClick(event: TimelineClickEvent) {
            //
            // - Édition d'une assignation
            //

            const eventTechnician: EventTechnician | undefined = (() => {
                if (!event.item) {
                    return undefined;
                }
                return this.event.technicians.find(
                    ({ id }: EventTechnician) => id === event.item!.id,
                );
            })();
            if (eventTechnician !== undefined) {
                this.handleUpdateAssignment(eventTechnician);
                return;
            }

            //
            // - Création d'une assignation
            //

            if (!event.group) {
                return;
            }

            const technician = this.technicians.find(
                ({ id }: TechnicianWithEvents) => id === event.group,
            );
            if (technician === undefined) {
                return;
            }

            const requestedTime = event.snappedTime;
            const minCreatablePeriod = new Period(
                requestedTime,
                requestedTime.add(MIN_TECHNICIAN_ASSIGNMENT_DURATION),
            );

            // - On vérifie que la période d'assignation minimale est bien disponible.
            const allAssignments: Array<EventTechnician | TechnicianEvent> = [
                ...technician.events,
                ...this.event.technicians.filter(
                    (_eventTechnician: EventTechnician) => (
                        _eventTechnician.technician.id === technician.id
                    ),
                ),
            ];
            const isRequestedTimeAvailable = !allAssignments.some(
                ({ period }: EventTechnician | TechnicianEvent) => (
                    minCreatablePeriod.overlaps(period)
                ),
            );
            if (!isRequestedTimeAvailable) {
                return;
            }

            this.handleCreateAssignment(technician, requestedTime);
        },

        async handleTimelineItemMove(item: TimelineItemIdentifier<EventTechnician['id']>, newPeriod: Period, finish: TimelineConfirmCallback) {
            const { $t: __ } = this;

            this.isLoading = true;
            try {
                await apiEvents.updateTechnicianAssignment(item.id, { period: newPeriod });
                this.$toasted.success(__('page.event-edit.steps.technicians.assignation-saved'));
                this.isLoading = false;
                finish(true);

                this.updateEvent();
            } catch (error) {
                this.isLoading = false;
                finish(false);

                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while saving the company`, error);
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                } else {
                    const { code = ApiErrorCode.UNKNOWN, details = {} } = error.response?.data?.error ?? {};
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        if (details.period && details.period.length > 0) {
                            this.$toasted.error(details.period[0]);
                        }
                    } else {
                        this.$toasted.error(__('errors.unexpected-while-saving'));
                    }
                }
            }
        },

        async handleTimelineItemRemove(item: TimelineItemIdentifier<EventTechnician['id']>, finish: TimelineConfirmCallback) {
            const { $t: __ } = this;

            const isConfirmed = await confirm({
                type: 'danger',
                text: __('page.event-edit.technician-item.confirm-permanently-delete'),
                confirmButtonText: __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                finish(false);
                return;
            }

            this.isLoading = true;
            try {
                await apiEvents.deleteTechnicianAssignment(item.id);
                this.$toasted.success(__('page.event-edit.steps.technicians.assignation-removed'));
                this.isLoading = false;
                finish(true);

                this.updateEvent();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
                this.isLoading = false;
                finish(false);
            }
        },

        handlePrevClick() {
            this.$emit('goToStep', 2);
        },

        handleNextClick() {
            this.$emit('goToStep', 4);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchAllTechnicians() {
            try {
                this.technicians = await apiTechnicians.allWhileEvent(this.event.id);
                this.isFetched = true;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving technicians:`, error);
                this.hasCriticalError = true;
            }
        },

        async updateEvent() {
            this.isLoading = true;
            try {
                const data = await apiEvents.one(this.event.id);
                this.$emit('updateEvent', data, { save: true });
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            groups,
            assignationPeriod,
            assignments,
            isLoading,
            isFetched,
            hasCriticalError,
            searchTerm,
            hasAssignableTechnicians,
            hasFilteredTechnicians,
            handleSearchChange,
            handleClickClearSearch,
            handleNextClick,
            handlePrevClick,
            handleTimelineItemMove,
            handleTimelineItemRemove,
            handleTimelineDoubleClick,
        } = this;

        const renderContent = (): JSX.Element => {
            if (hasCriticalError) {
                return <CriticalError />;
            }

            if (!isFetched) {
                return <Loading />;
            }

            if (!hasAssignableTechnicians) {
                return (
                    <div class="EventStep3__no-technician">
                        <p class="EventStep3__no-technician__message">
                            {__('page.event-edit.no-technician-pass-this-step')}
                        </p>
                        <Button
                            type="primary"
                            icon={{ name: 'arrow-right', position: 'after' }}
                            onClick={handleNextClick}
                        >
                            {__('page.event-edit.continue')}
                        </Button>
                    </div>
                );
            }

            if (!hasFilteredTechnicians) {
                return (
                    <div class="EventStep3__no-technician">
                        <p class="EventStep3__no-technician__message">
                            {__('page.event-edit.no-technician-with-this-search')}
                        </p>
                        <div class="EventStep3__no-technician__actions">
                            <Button icon="backspace" onClick={handleClickClearSearch}>
                                {__('page.event-edit.clear-search')}
                            </Button>
                        </div>
                    </div>
                );
            }

            return (
                <Timeline
                    class="EventStep3__timeline"
                    period={assignationPeriod}
                    zoomMin={MIN_ZOOM}
                    items={assignments}
                    groups={groups}
                    onItemMove={handleTimelineItemMove}
                    onItemRemove={handleTimelineItemRemove}
                    onDoubleClick={handleTimelineDoubleClick}
                    snapTime={{ precision: 15, unit: 'minutes' }}
                    hideCurrentTime
                    editable
                />
            );
        };

        return (
            <div class="EventStep3">
                <header class="EventStep3__header">
                    <h1 class="EventStep3__title">{__('page.event-edit.event-technicians')}</h1>
                    {hasAssignableTechnicians && (
                        <Input
                            value={searchTerm}
                            onInput={handleSearchChange}
                            placeholder={__('page.event-edit.technicians-search-placeholder')}
                            class="EventStep3__header__search"
                        />
                    )}
                    {isLoading && <Loading horizontal />}
                    {(!isLoading && hasAssignableTechnicians) && (
                        <Help
                            message={__('page.event-edit.technicians-help')}
                            class="EventStep3__header__help"
                        />
                    )}
                </header>
                <div class="EventStep3__content">
                    {renderContent()}
                </div>
                <section class="EventStep3__footer">
                    <Button
                        type="default"
                        icon={{ name: 'arrow-left', position: 'before' }}
                        disabled={isLoading}
                        onClick={handlePrevClick}
                    >
                        {__('page.event-edit.save-and-go-to-prev-step')}
                    </Button>
                    {hasAssignableTechnicians && (
                        <Button
                            type="primary"
                            disabled={isLoading}
                            icon={{ name: 'arrow-right', position: 'after' }}
                            onClick={handleNextClick}
                        >
                            {__('page.event-edit.save-and-go-to-next-step')}
                        </Button>
                    )}
                </section>
            </div>
        );
    },
});

export default EventStep3;
