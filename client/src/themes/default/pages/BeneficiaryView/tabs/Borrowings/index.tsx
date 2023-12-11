import './index.scss';
import { defineComponent } from '@vue/composition-api';
import moment from 'moment';
import { Group } from '@/stores/api/groups';
import { BookingEntity } from '@/stores/api/bookings';
import formatTimelineBooking from '@/utils/formatTimelineBooking';
import showModal from '@/utils/showModal';
import apiBeneficiaries from '@/stores/api/beneficiaries';
import EventDetails from '@/themes/default/modals/EventDetails';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Timeline from '@/themes/default/components/Timeline';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import Item from '../../components/BookingsItem';

import type { ComponentRef } from 'vue';
import type { PropType } from '@vue/composition-api';
import type { BeneficiaryDetails } from '@/stores/api/beneficiaries';
import type { BookingSummary } from '@/stores/api/bookings';

type Props = {
    /* Le bénéficiaire dont on veut afficher les emprunts. */
    beneficiary: BeneficiaryDetails,
};

type InstanceProperties = {
    cancelOngoingFetch: (() => void) | undefined,
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    bookings: BookingSummary[],
    hasCriticalError: boolean,
    isPartiallyFetched: boolean,
    isFullyFetched: boolean,
    isModalOpened: boolean,
    now: number,
};

const ONE_DAY = 1000 * 3600 * 24;

/* Contenu de l'onglet "emprunts" de la page de détails d'un bénéficiaire. */
const BeneficiaryViewBorrowings = defineComponent({
    name: 'BeneficiaryViewBorrowings',
    props: {
        beneficiary: {
            type: Object as PropType<Props['beneficiary']>,
            required: true,
        },
    },
    setup: (): InstanceProperties => ({
        cancelOngoingFetch: undefined,
        nowTimer: undefined,
    }),
    data: (): Data => ({
        bookings: [],
        hasCriticalError: false,
        isPartiallyFetched: false,
        isFullyFetched: false,
        isModalOpened: false,
        now: Date.now(),
    }),
    computed: {
        isTeamMember(): boolean {
            return this.$store.getters['auth/is']([Group.MEMBER, Group.ADMIN]);
        },

        timelineOptions(): Record<string, any> {
            const { isTeamMember } = this;

            return {
                start: moment().subtract(7, 'days').startOf('day'),
                end: moment().add(7, 'days').endOf('day'),
                editable: false,
                selectable: isTeamMember,
                locale: this.$store.state.i18n.locale,
                height: '100%',
                orientation: 'top',
                zoomMin: ONE_DAY * 7,
                zoomMax: ONE_DAY * 60,
            };
        },

        // FIXME: Typer la fonction `formatTimelineBooking` pour typer le retour de ce computed.
        timelineBookings() {
            const { $t: __, now, bookings } = this;
            const calendarSettings = this.$store.state.settings.calendar ?? {};

            const formatOptions = {
                showLocation: calendarSettings.event?.showLocation ?? true,
                showBorrower: calendarSettings.event?.showBorrower ?? false,
            };

            return bookings.map((booking: BookingSummary) => ({
                ...formatTimelineBooking(booking, __, now, formatOptions),
                editable: false,
            }));
        },
    },
    mounted() {
        this.fetchData();

        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60_000);
    },
    beforeDestroy() {
        this.cancelOngoingFetch?.();

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

        handleClickItem(booking: BookingSummary) {
            const date = moment(booking.start_date);

            const $timeline = this.$refs.timeline as ComponentRef<typeof Timeline>;
            $timeline?.moveTo(date);
        },

        async handleOpen(booking: BookingSummary) {
            // - On évite le double-call à cause d'un bug qui trigger l'event en double.
            //   @see https://github.com/visjs/vis-timeline/issues/301
            if (this.isModalOpened) {
                return;
            }

            const modalComponents = {
                [BookingEntity.EVENT]: EventDetails,
            };
            if (!(booking.entity in modalComponents)) {
                throw new Error('Unsupported booking type.');
            }

            this.isModalOpened = true;

            let shouldRefetch = false;
            const modalComponent = modalComponents[booking.entity];
            await showModal(this.$modal, modalComponent, {
                id: booking.id,
                onUpdated: () => {
                    shouldRefetch = true;
                },
                onDuplicated() {
                    shouldRefetch = true;
                },
                onDeleted: () => {
                    shouldRefetch = true;
                },
            });

            this.isModalOpened = false;

            if (shouldRefetch) {
                this.fetchData();
            }
        },

        handleDoubleClickTimeline(e: { item: string }) {
            // - Si c'est un double-clic sur une partie vide (= sans booking) du calendrier...
            //   => On ne pas va plus loin.
            const identifier = e.item;
            if (!identifier) {
                return;
            }

            // - Parsing de l'identifier du booking du calendrier.
            const identifierParts = identifier.split('-');
            if (identifierParts.length !== 2) {
                return;
            }
            const entity = identifierParts[0];
            const id = parseInt(identifierParts[1], 10);

            // - Récupération du booking lié.
            const booking = this.bookings.find((_booking: BookingSummary) => (
                _booking.entity === entity && _booking.id === id
            ));
            if (booking === undefined) {
                return;
            }

            this.handleOpen(booking);
        },

        handleClickTimeline(e: { item: string }) {
            const identifier = e.item;
            if (!identifier) {
                return;
            }

            const $item = this.$refs[`items[${identifier}]`] as ComponentRef<typeof Item>;
            $item?.scrollIntoView();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            const { beneficiary } = this;

            // - Annule la récupération en cours, s'il y en a une.
            this.cancelOngoingFetch?.();

            let isCancelled: boolean = false;
            this.cancelOngoingFetch = () => {
                isCancelled = true;
            };

            try {
                const fetchPageRecursive = async (page: number): Promise<void> => {
                    const { data, pagination } = await apiBeneficiaries.bookings(beneficiary.id, { page });
                    if (isCancelled) {
                        return;
                    }

                    if (page === 1) {
                        this.bookings = data;
                    } else {
                        this.bookings.push(...data);
                    }
                    this.isPartiallyFetched = true;
                    this.isFullyFetched = false;

                    if (page < pagination.total.pages) {
                        await fetchPageRecursive(page + 1);
                    }
                };
                await fetchPageRecursive(1);

                if (!isCancelled) {
                    this.isFullyFetched = true;
                    this.isPartiallyFetched = false;
                }
            } catch {
                this.hasCriticalError = true;
            }
        },
    },
    render() {
        const {
            $t: __,
            bookings,
            hasCriticalError,
            isPartiallyFetched,
            isFullyFetched,
            timelineOptions,
            timelineBookings,
            handleClickItem,
            handleOpen,
            handleDoubleClickTimeline,
            handleClickTimeline,
        } = this;

        if (hasCriticalError || (!isPartiallyFetched && !isFullyFetched)) {
            return (
                <div class="BeneficiaryViewBorrowings">
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </div>
            );
        }

        if (bookings.length === 0) {
            return (
                <div class="BeneficiaryViewBorrowings">
                    <EmptyMessage
                        message={__('page.beneficiary-view.borrowings.nothing-to-show')}
                    />
                </div>
            );
        }

        return (
            <div class="BeneficiaryViewBorrowings">
                <ul class="BeneficiaryViewBorrowings__listing">
                    {bookings.map((booking: BookingSummary) => (
                        <Item
                            ref={`items[${booking.entity}-${booking.id}]`}
                            key={`${booking.entity}-${booking.id}`}
                            booking={booking}
                            onClick={handleClickItem}
                            onOpen={handleOpen}
                        />
                    ))}
                </ul>
                <Timeline
                    ref="timeline"
                    class="BeneficiaryViewBorrowings__timeline"
                    items={timelineBookings}
                    options={timelineOptions}
                    onDoubleClick={handleDoubleClickTimeline}
                    onClick={handleClickTimeline}
                />
            </div>
        );
    },
});

export default BeneficiaryViewBorrowings;
