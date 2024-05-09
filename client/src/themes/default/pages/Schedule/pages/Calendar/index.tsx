import './index.scss';
import Day from '@/utils/day';
import config from '@/globals/config';
import debounce from 'lodash/debounce';
import DateTime from '@/utils/datetime';
import HttpCode from 'status-code-enum';
import { Group } from '@/stores/api/groups';
import { defineComponent } from '@vue/composition-api';
import apiBookings, { BookingEntity } from '@/stores/api/bookings';
import Queue from 'p-queue';
import EventDetails from '@/themes/default/modals/EventDetails';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Timeline from '@/themes/default/components/Timeline';
import CalendarHeader from './components/Header';
import CalendarCaption from './components/Caption';
import bookingFormatterFactory from '@/utils/formatTimelineBooking';
import { isRequestErrorStatusCode } from '@/utils/errors';
import parseInteger from '@/utils/parseInteger';
import showModal from '@/utils/showModal';
import { DEBOUNCE_WAIT_DURATION } from '@/globals/constants';
import {
    MIN_ZOOM,
    MAX_ZOOM,
    SNAP_TIME,
    FETCH_DELTA,
    MAX_FETCHES_PER_SECOND,
} from './_constants';
import {
    getDefaultPeriod,
    getCenterDateFromPeriod,
} from './_utils';

import type Period from '@/utils/period';
import type { EventDetails as EventDetailsType } from '@/stores/api/events';
import type { DebouncedMethod } from 'lodash';
import type { ComponentRef } from 'vue';
import type {
    TimelineItem,
    TimelineClickEvent,
} from '@/themes/default/components/Timeline';
import type {
    BookingExcerpt,
    BookingSummary,
} from '@/stores/api/bookings';

export type Filters = {
    missingMaterial: boolean,
    categoryId: number | null,
    parkId: number | null,
};

type InstanceProperties = {
    fetchMissingMaterialsQueue: Queue | undefined,
    nowTimer: ReturnType<typeof setInterval> | undefined,
    handleRangeChangedDebounced: (
        | DebouncedMethod<typeof ScheduleCalendar, 'handleRangeChanged'>
        | undefined
    ),
};

type LazyBooking<F extends boolean = boolean> = (
    F extends true
        ? { isComplete: true, booking: BookingSummary }
        : { isComplete: false, booking: BookingExcerpt }
);

type Data = {
    bookings: LazyBooking[],
    isLoading: boolean,
    isFetched: boolean,
    isSaving: boolean,
    hasCriticalError: boolean,
    centerDate: Day | null,
    defaultPeriod: Period,
    fetchPeriod: Period,
    filters: Filters,
    now: DateTime,
};

/** Page du calendrier des événements. */
const ScheduleCalendar = defineComponent({
    name: 'ScheduleCalendar',
    setup: (): InstanceProperties => ({
        handleRangeChangedDebounced: undefined,
        fetchMissingMaterialsQueue: undefined,
        nowTimer: undefined,
    }),
    data(): Data {
        const defaultPeriod = getDefaultPeriod();
        const fetchPeriod = defaultPeriod
            .setFullDays(true)
            .offset(FETCH_DELTA);

        return {
            bookings: [],
            isLoading: false,
            isFetched: false,
            isSaving: false,
            hasCriticalError: false,
            centerDate: null,
            defaultPeriod,
            fetchPeriod,
            filters: {
                missingMaterial: false,
                categoryId: null,
                parkId: (
                    this.$route.query.park
                        ? parseInteger(this.$route.query.park)
                        : null
                ),
            },
            now: DateTime.now(),
        };
    },
    computed: {
        isTeamMember(): boolean {
            return this.$store.getters['auth/is']([Group.MEMBER, Group.ADMIN]);
        },

        filteredBookings(): LazyBooking[] {
            const { bookings, filters } = this;

            return bookings.filter(({ isComplete, booking }: LazyBooking) => {
                // - Si on a un filtrage sur les événements, on ne laisse
                //   passer que les bookings avec matériel manquant.
                if (filters.missingMaterial && (!isComplete || !booking.has_missing_materials)) {
                    return false;
                }

                // - Si on a un filtrage sur un parc, on vérifie que le parc est présent
                //   parmi les parcs de l'événement.
                if (
                    filters.parkId !== null &&
                    booking.parks !== null &&
                    !booking.parks.includes(filters.parkId)
                ) {
                    return false;
                }

                // - Si on a un filtrage sur une catégorie, on vérifie que la catégorie est présente
                //   parmi les catégories de l'événement.
                if (
                    filters.categoryId !== null &&
                    booking.categories !== null &&
                    !booking.categories.includes(filters.categoryId)
                ) {
                    return false;
                }

                return true;
            });
        },

        timelineBookings(): TimelineItem[] {
            const { $t: __, now, filteredBookings } = this;
            const calendarSettings = this.$store.state.settings.calendar ?? {};

            const formatter = bookingFormatterFactory(__, now, {
                showEventLocation: calendarSettings.event?.showLocation ?? true,
                showEventBorrower: calendarSettings.event?.showBorrower ?? false,
            });

            return filteredBookings.map((lazy: LazyBooking): TimelineItem => (
                lazy.isComplete
                    ? formatter(lazy.booking, false)
                    : formatter(lazy.booking, true)
            ));
        },
    },
    created() {
        this.handleRangeChangedDebounced = debounce(
            this.handleRangeChanged.bind(this),
            DEBOUNCE_WAIT_DURATION.asMilliseconds(),
        );

        this.fetchMissingMaterialsQueue = new Queue({
            interval: DateTime.duration(1, 'second').asMilliseconds(),
            concurrency: config.maxConcurrentFetches,
            intervalCap: MAX_FETCHES_PER_SECOND,
        });
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = DateTime.now(); }, 60_000);
    },
    beforeDestroy() {
        this.handleRangeChangedDebounced?.cancel();
        this.fetchMissingMaterialsQueue?.clear();

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

        handleRefresh() {
            this.fetchData(true);
        },

        handleChangeCenterDate(day: Day) {
            this.centerDate = day;

            const $timeline = this.$refs.timeline as ComponentRef<typeof Timeline>;
            $timeline?.moveTo(day.toDateTime().set('hour', 12));
        },

        handleFilterMissingMaterial(filterMissingMaterial: Filters['missingMaterial']) {
            this.filters.missingMaterial = filterMissingMaterial;
        },

        handleFilterByPark(parkId: Filters['parkId']) {
            this.filters.parkId = parkId;
        },

        handleFilterByCategory(categoryId: Filters['categoryId']) {
            this.filters.categoryId = categoryId;
        },

        handleRangeChanged(newPeriod: Period) {
            localStorage.setItem('calendarPeriod', JSON.stringify(newPeriod));
            this.centerDate = getCenterDateFromPeriod(newPeriod);

            const newFetchPeriod = newPeriod
                .setFullDays(true)
                .offset(FETCH_DELTA);

            const needFetch = (
                !this.isFetched ||
                newFetchPeriod.start.isBefore(this.fetchPeriod.start) ||
                newFetchPeriod.end.isAfter(this.fetchPeriod.end)
            );
            if (needFetch) {
                this.fetchPeriod = newFetchPeriod;
                this.fetchData();
            }
        },

        //
        // - Handlers pour les items.
        //

        handleItemDoubleClick(payload: TimelineClickEvent) {
            const {
                isTeamMember,
                handleUpdatedBooking,
                handleDuplicatedBooking,
                handleDeletedBooking,
            } = this;

            // - Si c'est un double-clic sur une partie vide (= sans booking) du calendrier...
            //   => On redirige vers la création d'un événement avec cette date.
            const identifier = payload.item?.id ?? null;
            if (identifier === null) {
                // - Si l'utilisateur courant n'est pas un membre de l'équipe, on ne va pas plus loin.
                if (!isTeamMember) {
                    return;
                }

                // - Sinon, on redirige vers la création d'un événement.
                const atDate = new Day(payload.snappedTime).toString();
                this.$router.push({ name: 'add-event', query: { atDate } });
                return;
            }

            // - Parsing de l'identifier de l'événement du calendrier.
            const identifierParts = (identifier as string).split('-');
            if (identifierParts.length !== 2) {
                return;
            }
            const entity = identifierParts[0];
            const id = parseInteger(identifierParts[1]);
            if (id === null) {
                return;
            }

            // - Récupération du booking lié.
            const lazyBooking = this.bookings.find((lazy: LazyBooking) => (
                lazy.booking.entity === entity && lazy.booking.id === id
            ));
            if (lazyBooking === undefined) {
                return;
            }
            const { booking } = lazyBooking;

            switch (booking.entity) {
                case BookingEntity.EVENT: {
                    showModal(this.$modal, EventDetails, {
                        id: booking.id,
                        async onUpdated(event: EventDetailsType) {
                            try {
                                handleUpdatedBooking(await apiBookings.oneSummary(BookingEntity.EVENT, event.id));
                            } catch (error) {
                                // eslint-disable-next-line no-console
                                console.error('Error while retrieving updated booking data', error);
                            }
                        },
                        async onDuplicated(newEvent: EventDetailsType) {
                            try {
                                handleDuplicatedBooking(await apiBookings.oneSummary(BookingEntity.EVENT, newEvent.id));
                            } catch (error) {
                                // eslint-disable-next-line no-console
                                console.error('Error while retrieving duplicated booking data', error);
                            }
                        },
                        onDeleted() {
                            handleDeletedBooking(booking);
                        },
                    });
                    break;
                }
                default: {
                    throw new Error('Unsupported booking type.');
                }
            }
        },

        handleUpdatedBooking(booking: BookingSummary) {
            const originalBookingIndex = this.bookings.findIndex(
                ({ booking: _booking }: LazyBooking) => (
                    _booking.entity === booking.entity &&
                    _booking.id === booking.id
                ),
            );
            if (originalBookingIndex === -1) {
                return;
            }
            this.$set(this.bookings, originalBookingIndex, { isComplete: true, booking });
        },

        handleDuplicatedBooking(newBooking: BookingSummary) {
            this.bookings.push({ isComplete: true, booking: newBooking });

            const $timeline = this.$refs.timeline as ComponentRef<typeof Timeline>;
            $timeline?.moveTo(newBooking.mobilization_period.start);
        },

        handleDeletedBooking(booking: BookingExcerpt | BookingSummary) {
            const bookingIndex = this.bookings.findIndex(
                ({ booking: _booking }: LazyBooking) => (
                    _booking.entity === booking.entity &&
                    _booking.id === booking.id
                ),
            );
            if (bookingIndex === -1) {
                return;
            }
            this.bookings.splice(bookingIndex, 1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData(forceRefresh: boolean = false) {
            this.isLoading = true;

            // - Vide la file d'attente des requêtes avant de la re-peupler.
            this.fetchMissingMaterialsQueue?.clear();

            try {
                // - On garde en mémoire les données des bookings précédemment récupérés complètement
                //   pour éviter de renvoyer les requêtes de récupération inutilement pour ceux-ci.
                const prevCompleteBookings = new Map<BookingEntity, Map<number, BookingSummary>>([
                    [BookingEntity.EVENT, new Map()],
                ]);
                if (!forceRefresh) {
                    this.bookings.forEach(({ isComplete, booking }: LazyBooking) => {
                        if (isComplete) {
                            prevCompleteBookings
                                .get(booking.entity)!
                                .set(booking.id, booking);
                        }
                    });
                }

                this.bookings = (await apiBookings.all({ paginated: false, period: this.fetchPeriod })).map(
                    (booking: BookingExcerpt) => {
                        const prevEntityBookings = prevCompleteBookings.get(booking.entity);
                        return prevEntityBookings?.has(booking.id)
                            ? { isComplete: true, booking: prevEntityBookings.get(booking.id)! }
                            : { isComplete: false, booking };
                    },
                );

                this.isFetched = true;
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    const $timeline = this.$refs.timeline as ComponentRef<typeof Timeline>;
                    $timeline?.zoomIn(1, false);
                    return;
                }

                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving bookings:`, error);
                this.hasCriticalError = true;
            }

            try {
                const promises = this.bookings
                    .filter((lazy: LazyBooking): lazy is LazyBooking<false> => (
                        !lazy.isComplete &&
                        lazy.booking.mobilization_period.start.isAfter(this.now)
                    ))
                    .map(({ booking }: LazyBooking<false>) => async () => {
                        const finalBooking = await apiBookings.oneSummary(booking.entity, booking.id);
                        this.handleUpdatedBooking(finalBooking);
                    });

                await this.fetchMissingMaterialsQueue?.addAll(promises);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving missing materials:`, error);
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            filters,
            isLoading,
            isSaving,
            centerDate,
            defaultPeriod,
            hasCriticalError,
            timelineBookings,
            handleRefresh,
            handleFilterByPark,
            handleRangeChangedDebounced,
            handleItemDoubleClick,
            handleFilterByCategory,
            handleChangeCenterDate,
            handleFilterMissingMaterial,
        } = this;

        if (hasCriticalError) {
            return (
                <Page
                    name="schedule-calendar"
                    title={__('page.schedule.calendar.title')}
                    centered
                >
                    <CriticalError />
                </Page>
            );
        }

        return (
            <Page name="schedule-calendar" title={__('page.schedule.calendar.title')}>
                <div class="ScheduleCalendar">
                    <CalendarHeader
                        ref="header"
                        filters={filters}
                        centerDate={centerDate}
                        isLoading={isLoading || isSaving}
                        onRefresh={handleRefresh}
                        onChangeCenterDate={handleChangeCenterDate}
                        onFilterMissingMaterials={handleFilterMissingMaterial}
                        onFilterByCategory={handleFilterByCategory}
                        onFilterByPark={handleFilterByPark}
                    />
                    <Timeline
                        ref="timeline"
                        class="ScheduleCalendar__timeline"
                        defaultPeriod={defaultPeriod}
                        zoomMin={MIN_ZOOM}
                        zoomMax={MAX_ZOOM}
                        snapTime={SNAP_TIME}
                        items={timelineBookings}
                        onDoubleClick={handleItemDoubleClick}
                        onRangeChanged={handleRangeChangedDebounced}
                    />
                    <div class="ScheduleCalendar__footer">
                        <p class="ScheduleCalendar__footer__help">
                            {__('page.schedule.calendar.help')}
                        </p>
                        <CalendarCaption />
                    </div>
                </div>
            </Page>
        );
    },
});

export default ScheduleCalendar;
