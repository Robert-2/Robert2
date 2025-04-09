import './index.scss';
import Day from '@/utils/day';
import { defineComponent } from '@vue/composition-api';
import { TechniciansViewMode } from '@/stores/api/users';
import Button from '@/themes/default/components/Button';
import Dropdown from '@/themes/default/components/Dropdown';
import DatePicker from '@/themes/default/components/DatePicker';
import ViewModeSwitch from '../../../../components/ViewModeSwitch';
import FiltersPanel, { FiltersSchema } from '../Filters';

import type { Filters } from '../Filters';
import type { PropType } from '@vue/composition-api';

type Props = {
    /** La date sur laquelle le planning des techniciens est actuellement centré. */
    centerDate: Day | null,

    /** Filtres actuels du calendrier. */
    filters: Filters,

    /** Le planning ou la page sont t'ils en cours de chargement ? */
    isLoading?: boolean,
};

/** Header de la page de planning des techniciens. */
const TechniciansPlanningHeader = defineComponent({
    name: 'TechniciansPlanningHeader',
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
            validator: (value: unknown) => (
                FiltersSchema.safeParse(value).success
            ),
        },
        isLoading: {
            type: Boolean as PropType<Required<Props>['isLoading']>,
            default: false,
        },
    },
    emits: [
        'refresh',
        'filtersChange',
        'changeCenterDate',
    ],
    computed: {
        isToday(): boolean {
            if (this.centerDate === null) {
                return false;
            }
            return Day.today().isSame(this.centerDate);
        },
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

        handleFiltersChange(newFilters: Filters) {
            this.$emit('filtersChange', newFilters);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            if (!key.startsWith('global.')) {
                if (!key.startsWith('page.')) {
                    key = `page.sub-pages.timeline.${key}`;
                }
                key = key.replace(/^page\./, 'page.technicians.');
            } else {
                key = key.replace(/^global\./, '');
            }
            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            centerDate,
            filters,
            isToday,
            isLoading,
            handleRefresh,
            handleSetTodayDate,
            handleChangeCenterDate,
            handleFiltersChange,
        } = this;

        return (
            <div class="TechniciansPlanningHeader">
                <div class="ScheduleCalendarHeader__main">
                    <div class="TechniciansPlanningHeader__main__filters">
                        <DatePicker
                            type="date"
                            value={centerDate}
                            onInput={handleChangeCenterDate}
                            class="TechniciansPlanningHeader__main__filters__center-date"
                            withSnippets
                        />
                        <Button
                            type="transparent"
                            icon="compress-arrows-alt"
                            class="TechniciansPlanningHeader__main__filters__button"
                            onClick={handleSetTodayDate}
                            disabled={isToday}
                            collapsible
                        >
                            {__('global.center-on-today')}
                        </Button>
                        <Button
                            type="transparent"
                            icon="sync-alt"
                            class="TechniciansPlanningHeader__main__filters__button"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            collapsible
                        >
                            {__('global.action-refresh')}
                        </Button>
                    </div>
                    <div class="TechniciansPlanningHeader__main__actions">
                        <ViewModeSwitch mode={TechniciansViewMode.TIMELINE} />
                        <Button
                            type="add"
                            icon="user-plus"
                            to={{ name: 'add-technician' }}
                            collapsible
                        >
                            {__('page.action-add')}
                        </Button>
                        <Dropdown>
                            <Button icon="tools" to={{ name: 'roles' }}>
                                {__('page.manage-roles')}
                            </Button>
                        </Dropdown>
                    </div>
                </div>
                <FiltersPanel
                    values={filters}
                    onChange={handleFiltersChange}
                />
            </div>
        );
    },
});

export default TechniciansPlanningHeader;
