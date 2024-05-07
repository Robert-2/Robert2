import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Queue from 'p-queue';
import upperFirst from 'lodash/upperFirst';
import config from '@/globals/config';
import DateTime from '@/utils/datetime';
import apiBookings, { BookingEntity } from '@/stores/api/bookings';
import { UNCATEGORIZED } from '@/stores/api/materials';
import isValidInteger from '@/utils/isValidInteger';
import { isRequestErrorStatusCode } from '@/utils/errors';
import HttpCode from 'status-code-enum';
import showModal from '@/utils/showModal';
import getBookingIcon from '@/utils/getBookingIcon';
import EventDetails from '@/themes/default/modals/EventDetails';
import Fragment from '@/components/Fragment';
import Icon from '@/themes/default/components/Icon';
import CriticalError from '@/themes/default/components/CriticalError';
import Page from '@/themes/default/components/Page';
import { ServerTable } from '@/themes/default/components/Table';
import Button from '@/themes/default/components/Button';
import { BookingsViewMode } from '@/stores/api/users';
import Period, { PeriodReadableFormat } from '@/utils/period';
import ViewToggle from '../../components/BookingsViewToggle';
import ListFilters from './components/Filters';

import type { ComponentRef, CreateElement, VNodeClass } from 'vue';
import type { PaginatedData, PaginationParams } from '@/stores/api/@types';
import type { Column } from '@/themes/default/components/Table';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type { Filters, StateFilters } from './components/Filters';
import type { BookingExcerpt, BookingSummary } from '@/stores/api/bookings';

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
    fetchSummariesQueue: Queue | undefined,
};

type LazyBooking<F extends boolean = boolean> = (
    F extends true
        ? { isComplete: true, booking: BookingSummary }
        : { isComplete: false, booking: BookingExcerpt }
);

type Data = {
    isLoading: boolean,
    hasCriticalError: boolean,
    now: DateTime,
};

/** Nombre max. de bookings par page. */
const MAX_ITEMS_PER_PAGE = 30;

/**
 * Nombre de requêtes maximum pour la récupération du matériel
 * manquant envoyées par seconde.
 */
export const MAX_FETCHES_PER_SECOND: number = 15;

/** Page de listing des événements. */
const ScheduleListing = defineComponent({
    name: 'ScheduleListing',
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
        fetchSummariesQueue: undefined,
    }),
    data: (): Data => ({
        isLoading: false,
        hasCriticalError: false,
        now: DateTime.now(),
    }),
    computed: {
        filters(): Filters {
            const filters: Filters = {};
            const routeQuery = this.$route?.query ?? {};

            // - Catégorie.
            if ('category' in routeQuery) {
                if (routeQuery.category === UNCATEGORIZED) {
                    filters.category = UNCATEGORIZED;
                } else if (isValidInteger(routeQuery.category)) {
                    filters.category = parseInt(routeQuery.category, 10);
                }
            }

            // - Parc.
            if ('park' in routeQuery && isValidInteger(routeQuery.park)) {
                filters.park = parseInt(routeQuery.park, 10);
            }

            // - Période.
            if ('period_start' in routeQuery && 'period_end' in routeQuery) {
                filters.period = Period.from({
                    start: routeQuery.period_start,
                    end: routeQuery.period_end,
                    isFullDays: true,
                });
            }

            // - États du booking.
            (['endingToday', 'returnInventoryTodo', 'archived', 'notConfirmed'] as Array<keyof StateFilters>)
                .forEach((state: keyof StateFilters) => {
                    if (state in routeQuery && routeQuery[state] === '1') {
                        filters[state] = true;
                    }
                });

            return filters;
        },

        hasMultipleParks(): boolean {
            return this.$store.state.parks.list.length > 1;
        },

        columns(): Array<Column<LazyBooking>> {
            const { $t: __, now, hasMultipleParks, handleOpen } = this;
            const getCategoryName = this.$store.getters['categories/categoryName'];
            const getParkName = this.$store.getters['parks/parkName'];

            return [
                {
                    key: 'icon',
                    title: '',
                    class: 'ScheduleListing__cell ScheduleListing__cell--icon',
                    render(h: CreateElement, { isComplete, booking }: LazyBooking) {
                        const icon = getBookingIcon(booking, !isComplete, now);
                        return <Icon name={icon ?? 'circle-notch'} spin={icon === null} />;
                    },
                },
                {
                    key: 'title',
                    title: __('page.schedule.listing.columns.title'),
                    class: 'ScheduleListing__cell ScheduleListing__cell--title',
                    render(h: CreateElement, { booking }: LazyBooking) {
                        const getTitle = (): string => {
                            const { entity } = booking;
                            switch (entity) {
                                case BookingEntity.EVENT: {
                                    const { title, location } = booking;
                                    return !location ? title : `${title} (${location})`;
                                }
                                default: {
                                    throw new Error(`Unsupported entity ${entity}`);
                                }
                            }
                        };

                        const duration = booking.operation_period.asDays();
                        return (
                            <Fragment>
                                <h3 class="ScheduleListing__title">{getTitle()}</h3>
                                <div
                                    class="ScheduleListing__operation-period"
                                    title={__('duration-days', { duration }, duration)}
                                >
                                    {upperFirst(booking.operation_period.toReadable(__))}
                                </div>
                            </Fragment>
                        );
                    },
                },
                {
                    key: 'mobilization_start_date',
                    title: __('page.schedule.listing.columns.mobilization-period'),
                    class: 'ScheduleListing__cell ScheduleListing__cell--mobilization-period',
                    sortable: true,
                    render(h: CreateElement, { booking }: LazyBooking) {
                        const { mobilization_period: mobilizationPeriod } = booking;
                        const duration = mobilizationPeriod.asDays();
                        return (
                            <div title={__('duration-days', { duration }, duration)}>
                                {upperFirst(mobilizationPeriod.toReadable(__, PeriodReadableFormat.SHORT))}
                            </div>
                        );
                    },
                },
                {
                    key: 'beneficiary',
                    title: __('page.schedule.listing.columns.beneficiaries'),
                    class: 'ScheduleListing__cell ScheduleListing__cell--beneficiaries',
                    render(h: CreateElement, { booking }: LazyBooking) {
                        const { entity } = booking;
                        switch (entity) {
                            case BookingEntity.EVENT: {
                                // - Utilisation d'un Set pour dé-doublonner les noms des
                                //   bénéficiaires (si on a plusieurs contacts de la même company).
                                const beneficiaries: Set<string> = new Set(
                                    booking.beneficiaries
                                        .map(({ company, full_name: fullName }: Beneficiary) => (
                                            (company ? company.legal_name : fullName) ?? ''
                                        )),
                                );

                                if (beneficiaries.size === 0) {
                                    return (
                                        <span class="ScheduleListing__cell__empty">
                                            {__('not-specified')}
                                        </span>
                                    );
                                }

                                return (
                                    <ul class="ScheduleListing__beneficiaries">
                                        {Array.from(beneficiaries).map((name: string) => (
                                            <li key={name} class="ScheduleListing__beneficiaries__item">
                                                {name}
                                            </li>
                                        ))}
                                    </ul>
                                );
                            }
                            default: {
                                throw new Error(`Unsupported entity ${entity}`);
                            }
                        }
                    },
                },
                {
                    key: 'parks',
                    title: __('page.schedule.listing.columns.parks'),
                    class: 'ScheduleListing__cell ScheduleListing__cell--parks',
                    hidden: !hasMultipleParks,
                    render(h: CreateElement, { booking }: LazyBooking) {
                        const parks: string[] = booking.parks.map(getParkName);
                        if (parks.length === 0) {
                            return null;
                        }

                        return (
                            <ul class="ScheduleListing__parks">
                                {parks.map((parkName: string) => (
                                    <li key={parkName} class="ScheduleListing__parks__item">{parkName}</li>
                                ))}
                            </ul>
                        );
                    },
                },
                {
                    key: 'categories',
                    title: __('page.schedule.listing.columns.categories'),
                    class: 'ScheduleListing__cell ScheduleListing__cell--categories',
                    render(h: CreateElement, { booking }: LazyBooking) {
                        if (booking.categories.length === 0) {
                            return null;
                        }

                        const categories: string[] = booking.categories.map(getCategoryName);
                        return (
                            <ul class="ScheduleListing__categories">
                                {categories.map((category: string) => (
                                    <li key={category} class="ScheduleListing__categories__item">{category}</li>
                                ))}
                            </ul>
                        );
                    },
                },
                {
                    key: 'actions',
                    title: '',
                    class: 'ScheduleListing__cell ScheduleListing__cell--actions',
                    render: (h: CreateElement, lazyBooking: LazyBooking) => (
                        <Button
                            icon="eye"
                            onClick={(e: Event) => {
                                e.stopPropagation();
                                handleOpen(lazyBooking);
                            }}
                        />
                    ),
                },
            ];
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('parks/fetch');

        this.fetchSummariesQueue = new Queue({
            interval: DateTime.duration(1, 'second').asMilliseconds(),
            concurrency: config.maxConcurrentFetches,
            intervalCap: MAX_FETCHES_PER_SECOND,
        });

        // - Binding.
        this.fetch = this.fetch.bind(this);
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = DateTime.now(); }, 60_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }

        // - Vide la file d'attente des requêtes.
        this.fetchSummariesQueue?.clear();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleOpen({ booking }: LazyBooking) {
            const modalComponents = {
                [BookingEntity.EVENT]: EventDetails,
            };
            if (!(booking.entity in modalComponents)) {
                throw new Error('Unsupported booking type.');
            }

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

            if (shouldRefetch) {
                this.refreshTable();
            }
        },

        handleFiltersChange(newFilters: Filters) {
            const query: Record<string, string> = {};
            if (newFilters.park !== undefined) {
                query.park = newFilters.park.toString();
            }
            if (newFilters.category !== undefined) {
                query.category = newFilters.category.toString();
            }
            if (newFilters.period !== undefined) {
                const serializedPeriod = newFilters.period.toSerialized();
                query.period_start = serializedPeriod.start;
                query.period_end = serializedPeriod.end;
            }
            if (newFilters.endingToday !== undefined) {
                query.endingToday = '1';
            }
            if (newFilters.returnInventoryTodo !== undefined) {
                query.returnInventoryTodo = '1';
            }
            if (newFilters.archived !== undefined) {
                query.archived = '1';
            }
            if (newFilters.notConfirmed !== undefined) {
                query.notConfirmed = '1';
            }

            this.$router.push({ query });
            this.setTablePage(1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch(pagination: PaginationParams): Promise<{ data: PaginatedData<LazyBooking[]> } | undefined> {
            this.isLoading = true;
            const { filters } = this;

            // - Vide la file d'attente des requêtes avant de la re-peupler.
            this.fetchSummariesQueue?.clear();

            try {
                const data = await apiBookings.all({
                    paginated: true,
                    ...pagination,
                    ...filters,
                });

                const lazyData: LazyBooking[] = data.data.map(
                    (booking: BookingExcerpt) => ({ isComplete: false, booking }),
                );

                this.fetchSummaries(lazyData);

                return { data: { data: lazyData, pagination: data.pagination } };
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.setTablePage(1);
                    return undefined;
                }

                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving bookings:`, error);
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },

        async fetchSummaries(data: LazyBooking[]) {
            const promises = data
                .filter((lazy: LazyBooking): lazy is LazyBooking<false> => (
                    !lazy.isComplete &&
                    lazy.booking.mobilization_period.start.isAfter(this.now)
                ))
                .map(({ booking }: LazyBooking<false>) => async () => {
                    const finalBooking = await apiBookings.oneSummary(booking.entity, booking.id);

                    const index = data.findIndex(({ booking: { entity, id } }: LazyBooking) => (
                        entity === booking.entity && id === booking.id
                    ));
                    if (index === undefined) {
                        return;
                    }

                    this.$set(data, index, { isComplete: true, booking: finalBooking });
                });

            await this.fetchSummariesQueue?.addAll(promises);
        },

        setTablePage(page: number) {
            (this.$refs.table as ComponentRef<typeof ServerTable>)?.setPage(page);
        },

        refreshTable() {
            (this.$refs.table as ComponentRef<typeof ServerTable>)?.refresh();
        },
    },
    render() {
        const {
            $t: __,
            isLoading,
            hasCriticalError,
            filters,
            $options,
            columns,
            fetch,
            handleOpen,
            handleFiltersChange,
        } = this;

        if (hasCriticalError) {
            return (
                <Page
                    name="schedule-listing"
                    title={__('page.schedule.listing.title')}
                    centered
                >
                    <CriticalError />
                </Page>
            );
        }

        const actions = [
            <ViewToggle mode={BookingsViewMode.LISTING} />,
            <Button type="add" to={{ name: 'add-event' }}>
                {__('page.schedule.listing.add-event')}
            </Button>,
        ];

        const getRowClass = ({ booking }: LazyBooking): VNodeClass => {
            const isFuture = !booking.operation_period.isPastOrOngoing();
            const isPast = booking.operation_period.isPast();

            const hasWarnings: boolean = (
                // - Si le booking est à venir et qu'il manque du matériel.
                (isFuture && !!(booking as BookingSummary).has_missing_materials) ||

                // - Si le booking est passé et qu'il a du matériel manquant.
                (isPast && !booking.is_archived && !!booking.has_not_returned_materials)
            );

            return ['ScheduleListing__row', {
                'ScheduleListing__row--with-warning': hasWarnings,
            }];
        };

        return (
            <Page
                name="schedule-listing"
                title={__('page.schedule.listing.title')}
                loading={isLoading}
                actions={actions}
            >
                <div class="ScheduleListing">
                    <div class="ScheduleListing__filters">
                        <ListFilters
                            values={filters}
                            onChange={handleFiltersChange}
                            class="ScheduleListingHeader__filters"
                        />
                    </div>
                    <ServerTable
                        ref="table"
                        key="default"
                        name={$options.name}
                        rowClass={getRowClass}
                        columns={columns}
                        fetcher={fetch}
                        onRowClick={handleOpen}
                        defaultOrderBy={{ column: 'mobilization_start_date', ascending: false }}
                        perPage={MAX_ITEMS_PER_PAGE}
                    />
                </div>
            </Page>
        );
    },
});

export default ScheduleListing;
