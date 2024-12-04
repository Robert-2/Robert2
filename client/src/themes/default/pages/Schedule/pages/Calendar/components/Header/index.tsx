import './index.scss';
import Day from '@/utils/day';
import { z } from '@/utils/validation';
import { defineComponent } from '@vue/composition-api';
import Button from '@/themes/default/components/Button';
import DatePicker from '@/themes/default/components/DatePicker';
import Select from '@/themes/default/components/Select';
import SwitchToggle from '@/themes/default/components/SwitchToggle';
import Loading from '@/themes/default/components/Loading';
import parseInteger from '@/utils/parseInteger';
import { Group } from '@/stores/api/groups';
import { BookingsViewMode } from '@/stores/api/users';
import ViewToggle from '../../../../components/BookingsViewToggle';

import type { Filters } from '../..';
import type { PropType } from '@vue/composition-api';
import type { Options } from '@/utils/formatOptions';
import type { ParkSummary } from '@/stores/api/parks';
import type { CategoryDetails } from '@/stores/api/categories';

type Props = {
    /** La date sur laquelle le calendrier est actuellement centré. */
    centerDate: Day | null,

    /** Filtres actuels du calendrier. */
    filters: Filters,

    /**
     * Le calendrier ou la page sont t'ils en cours de chargement ?
     * Si `true`, affichera un spinner de chargement dans le header.
     */
    isLoading?: boolean,
};

/** Header de la page calendrier. */
const ScheduleCalendarHeader = defineComponent({
    name: 'ScheduleCalendarHeader',
    props: {
        centerDate: {
            type: Object as PropType<Required<Props>['centerDate']>,
            default: null,
            validator: (value: unknown) => (
                value === null || value instanceof Day
            ),
        },
        filters: {
            type: Object as PropType<Required<Props>['filters']>,
            required: true,
            validator: (value: unknown) => {
                const schema = z.strictObject({
                    missingMaterial: z.boolean(),
                    categoryId: z.number().nullable(),
                    parkId: z.number().nullable(),
                });
                return schema.safeParse(value).success;
            },
        },
        isLoading: {
            type: Boolean as PropType<Required<Props>['isLoading']>,
            default: false,
        },
    },
    emits: [
        'refresh',
        'filterByPark',
        'filterByCategory',
        'filterMissingMaterials',
        'changeCenterDate',
    ],
    computed: {
        parksOptions(): Options<ParkSummary> {
            return this.$store.getters['parks/options'];
        },

        withParkFilter(): boolean {
            return (
                this.filters.parkId !== null ||
                this.parksOptions.length > 1
            );
        },

        categoriesOptions(): Options<CategoryDetails> {
            return this.$store.getters['categories/options'];
        },

        isToday(): boolean {
            if (this.centerDate === null) {
                return false;
            }
            return Day.today().isSame(this.centerDate);
        },

        isTeamMember(): boolean {
            return this.$store.getters['auth/is']([Group.ADMINISTRATION, Group.MANAGEMENT]);
        },
    },
    created() {
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('categories/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleRefresh() {
            this.$emit('refresh');
        },

        handleChangeCenterDate(newDate: Day) {
            this.$emit('changeCenterDate', newDate);
        },

        handleSetTodayDate() {
            this.$emit('changeCenterDate', Day.today());
        },

        handleFilterParkChange(park: number | string) {
            const parkId = park || park === 0 ? parseInteger(park) : null;
            this.$emit('filterByPark', parkId);
        },

        handleFilterCategoryChange(category: number | string) {
            const categoryId = category || category === 0 ? parseInteger(category) : null;
            this.$emit('filterByCategory', categoryId);
        },

        handleFilterMissingMaterialChange(hasFilter: boolean) {
            this.$emit('filterMissingMaterials', hasFilter);
        },
    },
    render() {
        const {
            $t: __,
            centerDate,
            filters,
            isToday,
            isTeamMember,
            isLoading,
            withParkFilter,
            parksOptions,
            categoriesOptions,
            handleSetTodayDate,
            handleChangeCenterDate,
            handleFilterParkChange,
            handleFilterCategoryChange,
            handleFilterMissingMaterialChange,
            handleRefresh,
        } = this;

        return (
            <div class="ScheduleCalendarHeader">
                <div class="ScheduleCalendarHeader__filters">
                    <div class="ScheduleCalendarHeader__filters__timeline">
                        <DatePicker
                            type="date"
                            value={centerDate}
                            onInput={handleChangeCenterDate}
                            class="ScheduleCalendarHeader__filters__timeline__center-date"
                            withSnippets
                        />
                        <Button
                            type="transparent"
                            icon="compress-arrows-alt"
                            class="ScheduleCalendarHeader__filters__timeline__button"
                            title={__('page.schedule.calendar.center-on-today')}
                            onClick={handleSetTodayDate}
                            disabled={isToday}
                            collapsible
                        >
                            <span class="ScheduleCalendarHeader__filters__timeline__button__title">
                                {__('page.schedule.calendar.center-on-today')}
                            </span>
                        </Button>
                        <Button
                            type="transparent"
                            icon="sync-alt"
                            class="ScheduleCalendarHeader__filters__timeline__button"
                            title={__('action-refresh')}
                            onClick={handleRefresh}
                            disabled={isLoading}
                            collapsible
                        >
                            <span class="ScheduleCalendarHeader__button__title">
                                {__('action-refresh')}
                            </span>
                        </Button>
                        <div class="ScheduleCalendarHeader__filters__timeline__loading">
                            {isLoading && <Loading horizontal minimalist />}
                        </div>
                    </div>
                    <div class="ScheduleCalendarHeader__filters__general">
                        {withParkFilter && (
                            <div class="ScheduleCalendarHeader__filter ScheduleCalendarHeader__filter--parks">
                                <Select
                                    value={filters.parkId}
                                    class="ScheduleCalendarHeader__filter__select"
                                    onChange={handleFilterParkChange}
                                    options={parksOptions}
                                    placeholder={__('page.schedule.calendar.display-all-parks')}
                                    highlight={filters.parkId !== null && parksOptions.length > 1}
                                />
                            </div>
                        )}
                        {categoriesOptions.length > 0 && (
                            <div class="ScheduleCalendarHeader__filter ScheduleCalendarHeader__filter--categories">
                                <Select
                                    value={filters.categoryId}
                                    class="ScheduleCalendarHeader__filter__select"
                                    onChange={handleFilterCategoryChange}
                                    options={categoriesOptions}
                                    placeholder={__('page.schedule.calendar.display-all-categories')}
                                    highlight={filters.categoryId !== null && categoriesOptions.length > 1}
                                />
                            </div>
                        )}
                        <div
                            class={['ScheduleCalendarHeader__filter', {
                                'ScheduleCalendarHeader__filter--active': filters.missingMaterial,
                            }]}
                        >
                            <label class="ScheduleCalendarHeader__filter__label">
                                {__('page.schedule.calendar.event-with-missing-material-only')}
                            </label>
                            <SwitchToggle
                                value={filters.missingMaterial}
                                onInput={handleFilterMissingMaterialChange}
                            />
                        </div>
                    </div>
                </div>
                <div class="ScheduleCalendarHeader__actions">
                    <ViewToggle mode={BookingsViewMode.CALENDAR} />
                    {isTeamMember && (
                        <Button type="add" to={{ name: 'add-event' }}>
                            {__('page.schedule.calendar.add-event')}
                        </Button>
                    )}
                </div>
            </div>
        );
    },
});

export default ScheduleCalendarHeader;
