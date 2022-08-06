import './index.scss';
import moment from 'moment';
import Button from '@/components/Button';
import Datepicker from '@/components/Datepicker';
import Select from '@/components/Select';
import SwitchToggle from '@/components/SwitchToggle';
import Loading from '@/components/Loading';
import { Group } from '@/stores/api/groups';

// @vue/component
export default {
    name: 'CalendarHeader',
    props: {
        isLoading: Boolean,
    },
    data() {
        return {
            centerDate: null,
            filters: {
                park: this.$route.query.park || '',
                hasMissingMaterials: false,
            },
        };
    },
    computed: {
        parksOptions() {
            return this.$store.getters['parks/options'];
        },

        isToday() {
            return moment(this.centerDate).isSame(moment(), 'day');
        },

        isVisitor() {
            return this.$store.getters['auth/is'](Group.VISITOR);
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
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

        handleSetCenterDate(newDate) {
            newDate = moment(newDate).hour(12).minute(0).toDate();
            this.$emit('setCenterDate', newDate);
        },

        handleSetTodayDate() {
            const now = moment().hour(12).minute(0).toDate();
            this.$emit('setCenterDate', now);
        },

        handleFilterParkChange(parkId) {
            this.filters.park = parkId;
            this.$emit('filterByPark', parkId);
        },

        handleFilterMissingMaterialChange(hasFilter) {
            this.filters.hasMissingMaterials = hasFilter;
            this.$emit('filterMissingMaterials', hasFilter);
        },

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        changePeriod(newPeriod) {
            const start = moment(newPeriod.start);
            const end = moment(newPeriod.end);
            const duration = end.diff(start, 'hours');

            this.centerDate = start
                .add(duration / 2, 'hours')
                .format('YYYY-MM-DD');
        },
    },
    render() {
        const {
            $t: __,
            centerDate,
            filters,
            isToday,
            isVisitor,
            isLoading,
            parksOptions,
            handleSetTodayDate,
            handleSetCenterDate,
            handleFilterParkChange,
            handleFilterMissingMaterialChange,
            handleRefresh,
        } = this;

        return (
            <div class="CalendarHeader">
                <div class="CalendarHeader__timeline-actions">
                    <Datepicker
                        type="date"
                        value={centerDate}
                        onInput={handleSetCenterDate}
                        class="CalendarHeader__center-date"
                    />
                    <Button
                        type="secondary"
                        class="CalendarHeader__button"
                        title={__('page.calendar.center-on-today')}
                        onClick={handleSetTodayDate}
                        disabled={isToday}
                        icon="compress-arrows-alt"
                    >
                        <span class="CalendarHeader__button__title">
                            {__('page.calendar.center-on-today')}
                        </span>
                    </Button>
                    <Button
                        type="secondary"
                        class="CalendarHeader__button"
                        title={__('action-refresh')}
                        onClick={handleRefresh}
                        disabled={isLoading}
                        icon="sync-alt"
                    >
                        <span class="CalendarHeader__button__title">
                            {__('action-refresh')}
                        </span>
                    </Button>
                </div>
                <div class="CalendarHeader__loading-container">
                    {isLoading && <Loading horizontal />}
                </div>
                <div class="CalendarHeader__filters">
                    {parksOptions.length > 1 && (
                        <div class="CalendarHeader__filter">
                            <Select
                                value={filters.park}
                                class="CalendarHeader__filter__select"
                                onChange={handleFilterParkChange}
                                options={parksOptions}
                                placeholder={__('page.calendar.display-all-parks')}
                                highlight={!!filters.park}
                            />
                        </div>
                    )}
                    <div
                        class={['CalendarHeader__filter', {
                            'CalendarHeader__filter--active': filters.hasMissingMaterials,
                        }]}
                    >
                        <label class="CalendarHeader__filter__label">
                            {__('page.calendar.event-with-missing-material-only')}
                        </label>
                        <SwitchToggle
                            value={filters.hasMissingMaterials}
                            onInput={handleFilterMissingMaterialChange}
                        />
                    </div>
                </div>
                <div class="CalendarHeader__actions">
                    {!isVisitor && (
                        <Button type="add" to="/events/new">
                            {__('page.calendar.add-event')}
                        </Button>
                    )}
                </div>
            </div>
        );
    },
};
