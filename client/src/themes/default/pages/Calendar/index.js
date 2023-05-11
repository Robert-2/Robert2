import './index.scss';
import moment from 'moment';
import HttpCode from 'status-code-enum';
import { Group } from '@/stores/api/groups';
import { DATE_DB_FORMAT } from '@/globals/constants';
import apiBookings, { BookingEntity } from '@/stores/api/bookings';
import apiEvents from '@/stores/api/events';
import EventDetails from '@/themes/default/modals/EventDetails';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Timeline from '@/themes/default/components/Timeline';
import CalendarHeader from './components/Header';
import CalendarCaption from './components/Caption';
import formatTimelineBooking from '@/utils/formatTimelineBooking';
import { isRequestErrorStatusCode } from '@/utils/errors';
import showModal from '@/utils/showModal';
import { getDefaultPeriod } from './_utils';

const ONE_DAY = 1000 * 3600 * 24;
const FETCH_DELTA_DAYS = 3;
const MAX_ZOOM_MONTH = 3;

// @vue/component
export default {
    name: 'Calendar',
    data() {
        const parkFilter = this.$route.query.park;
        const { start, end } = getDefaultPeriod();

        return {
            bookings: [],
            hasCriticalError: false,
            isLoading: false,
            isFetched: false,
            isSaving: false,
            isOverItem: false,
            fetchStart: moment(start).subtract(FETCH_DELTA_DAYS, 'days').startOf('day'),
            fetchEnd: moment(end).add(FETCH_DELTA_DAYS, 'days').endOf('day'),
            isModalOpened: false,
            filters: {
                parkId: parkFilter ? Number.parseInt(parkFilter, 10) : null,
                missingMaterial: false,
            },
            now: Date.now(),
        };
    },
    computed: {
        helpText() {
            const { $t: __, isOverItem } = this;

            return isOverItem
                ? __('page.calendar.help-timeline-event-operations')
                : __('page.calendar.help');
        },

        isTeamMember() {
            return this.$store.getters['auth/is']([Group.MEMBER, Group.ADMIN]);
        },

        timelineOptions() {
            const { isTeamMember } = this;
            const { start, end } = getDefaultPeriod();

            return {
                start,
                end,
                selectable: isTeamMember,
                zoomMin: ONE_DAY * 7,
                zoomMax: ONE_DAY * 30 * MAX_ZOOM_MONTH,
            };
        },

        timelineBookings() {
            const { $t: __, now, bookings } = this;
            const calendarSettings = this.$store.state.settings.calendar ?? {};

            const formatOptions = {
                showLocation: calendarSettings.event?.showLocation ?? true,
                showBorrower: calendarSettings.event?.showBorrower ?? false,
            };

            return bookings.map((booking) => (
                formatTimelineBooking(booking, __, now, formatOptions)
            ));
        },

        timelineBookingsFiltered() {
            const { timelineBookings, filters } = this;

            return timelineBookings.filter(({ booking }) => {
                // - Si on a un filtrage sur les événements / réservations, on ne laisse
                //   passer que les bookings avec matériel manquant.
                if (filters.missingMaterial && !booking.has_missing_materials) {
                    return false;
                }

                // - Si on a un filtrage sur un parc, on vérifie que le parc est présent
                //   parmi les parcs de l'événement / réservation.
                if (filters.parkId !== null && booking.parks !== null && !booking.parks.includes(filters.parkId)) {
                    return false;
                }

                return true;
            });
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60_000);
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

        handleRefresh() {
            this.fetchData();
        },

        handleSetCenterDate(date) {
            this.$refs.timelineRef.moveTo(date);
        },

        handleFilterMissingMaterial(filterMissingMaterial) {
            this.filters.missingMaterial = filterMissingMaterial;
        },

        handleFilterByPark(parkId) {
            this.filters.parkId = parkId !== ''
                ? Number.parseInt(parkId, 10)
                : null;
        },

        handleRangeChanged(newPeriod) {
            const dates = Object.fromEntries(['start', 'end'].map(
                (type) => [type, moment(newPeriod[type])],
            ));

            localStorage.setItem('calendarStart', dates.start.format('YYYY-MM-DD HH:mm:ss'));
            localStorage.setItem('calendarEnd', dates.end.format('YYYY-MM-DD HH:mm:ss'));
            this.$refs.headerRef.changePeriod(dates);

            const newFetchStart = moment(dates.start).subtract(FETCH_DELTA_DAYS, 'days').startOf('day');
            const newFetchEnd = moment(dates.end).add(FETCH_DELTA_DAYS, 'days').endOf('day');

            const needFetch = (
                !this.isFetched ||
                newFetchStart.isBefore(this.fetchStart) ||
                newFetchEnd.isAfter(this.fetchEnd)
            );
            if (needFetch) {
                this.fetchStart = newFetchStart;
                this.fetchEnd = newFetchEnd;
                this.fetchData();
            }
        },

        //
        // - Handlers pour les items.
        //

        handleItemOver() {
            this.isOverItem = true;
        },

        handleItemOut() {
            this.isOverItem = false;
        },

        handleItemDoubleClick(e) {
            // - On évite le double-call à cause d'un bug qui trigger l'event en double.
            //   @see https://github.com/visjs/vis-timeline/issues/301
            if (this.isModalOpened) {
                return;
            }

            const {
                isTeamMember,
                handleUpdatedBooking,
                handleDuplicatedBooking,
            } = this;

            // - Si c'est un double-clic sur une partie vide (= sans booking) du calendrier...
            //   => On redirige vers la création d'un événement avec cette date.
            const identifier = e.item;
            if (identifier === null) {
                // - Si l'utilisateur courant n'est pas un membre de l'équipe, on ne va pas plus loin.
                if (!isTeamMember) {
                    return;
                }

                // - Sinon, on redirige vers la création d'un événement.
                const atDate = moment(e.time).startOf('day').format('YYYY-MM-DD');
                this.$router.push({ name: 'add-event', query: { atDate } });
                return;
            }

            // - Parsing de l'identifier de l'événement du calendrier.
            const identifierParts = identifier.split('-');
            if (identifierParts.length !== 2) {
                return;
            }
            const entity = identifierParts[0];
            const id = parseInt(identifierParts[1], 10);

            // - Récupération du booking lié.
            const booking = this.bookings.find((_booking) => (
                _booking.entity === entity && _booking.id === id
            ));
            if (booking === undefined) {
                return;
            }

            const _showModal = (component, props) => {
                this.isModalOpened = true;
                showModal(this.$modal, component, {
                    ...props,
                    onClose: () => { this.fetchData(); },
                    onClosed: () => { this.isModalOpened = false; },
                });
            };

            switch (booking.entity) {
                case BookingEntity.EVENT:
                    _showModal(EventDetails, {
                        id: booking.id,
                        onUpdated(event) {
                            handleUpdatedBooking({ entity: BookingEntity.EVENT, ...event });
                        },
                        onDuplicateEvent(newEvent) {
                            handleDuplicatedBooking({ entity: BookingEntity.EVENT, ...newEvent });
                        },
                    });
                    break;

                default:
                    // - Modale non prise en charge.
            }
        },

        async handleItemMoved(item, callback) {
            const { booking: { id, entity } } = item;
            const { isTeamMember } = this;

            // - Si ce n'est pas un événement qui a été déplacé ou que l'utilisateur
            //   courant n'est pas un membre de l'équipe, on empêche le changement.
            if (entity !== BookingEntity.EVENT || !isTeamMember) {
                callback(null);
                return;
            }

            // - Nouvelles dates.
            const newStartDate = moment(item.start).startOf('day');
            const newEndDate = moment(item.end);
            if (newEndDate.hour() === 0) {
                newEndDate.subtract(1, 'day').endOf('day');
            }
            newEndDate.endOf('day');

            const { $t: __ } = this;
            this.isSaving = true;

            try {
                await apiEvents.update(id, {
                    start_date: newStartDate.format(DATE_DB_FORMAT),
                    end_date: newEndDate.format(DATE_DB_FORMAT),
                });

                // - Permet de placer l'élément à sa nouvelle place sur la timeline
                callback(item);

                this.$toasted.success(__('page.calendar.event-saved'));
                this.fetchData();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-saving'));

                // - Permet d'annuler le déplacement de l'élément sur la timeline
                callback(null);
            } finally {
                this.isSaving = false;
            }
        },

        handleUpdatedBooking(booking) {
            const originalBookingIndex = this.bookings.findIndex(
                ({ entity, id }) => entity === booking.entity && id === booking.id,
            );
            if (originalBookingIndex === -1) {
                return;
            }

            this.$set(this.bookings, originalBookingIndex, booking);
        },

        handleDuplicatedBooking(booking) {
            const date = moment(booking.start_date).toDate();
            this.$refs.timelineRef.moveTo(date);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            this.isLoading = true;
            this.isModalOpened = false;

            try {
                this.bookings = await apiBookings.all(this.fetchStart, this.fetchEnd);
                this.isFetched = true;
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.$refs.timelineRef.zoomIn(1, { animation: false });
                    return;
                }
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            isLoading,
            isSaving,
            hasCriticalError,
            helpText,
            timelineBookingsFiltered,
            timelineOptions,
            handleRefresh,
            handleItemDoubleClick,
            handleRangeChanged,
            handleFilterByPark,
            handleSetCenterDate,
            handleFilterMissingMaterial,
            handleItemOver,
            handleItemOut,
            handleItemMoved,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="calendar" title={__('page.calendar.title')}>
                    <CriticalError />
                </Page>
            );
        }

        return (
            <Page name="calendar" title={__('page.calendar.title')}>
                <div class="Calendar">
                    <CalendarHeader
                        ref="headerRef"
                        isLoading={isLoading || isSaving}
                        onRefresh={handleRefresh}
                        onSetCenterDate={handleSetCenterDate}
                        onFilterMissingMaterials={handleFilterMissingMaterial}
                        onFilterByPark={handleFilterByPark}
                    />
                    <Timeline
                        ref="timelineRef"
                        class="Calendar__timeline"
                        items={timelineBookingsFiltered}
                        options={timelineOptions}
                        onItemOver={handleItemOver}
                        onItemOut={handleItemOut}
                        onItemMoved={handleItemMoved}
                        onDoubleClick={handleItemDoubleClick}
                        onRangeChanged={handleRangeChanged}
                    />
                    <div class="Calendar__footer">
                        <p class="Calendar__footer__help">{helpText}</p>
                        <CalendarCaption />
                    </div>
                </div>
            </Page>
        );
    },
};
