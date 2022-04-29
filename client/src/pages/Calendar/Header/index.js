import './index.scss';
import moment from 'moment';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import SwitchToggle from '@/components/SwitchToggle';

// @vue/component
export default {
    name: 'CalendarHeader',
    props: {
        isLoading: Boolean,
    },
    data() {
        return {
            centerDate: '',
            filters: {
                park: this.$route.query.park || '',
                hasMissingMaterials: false,
            },
        };
    },
    computed: {
        parks() {
            return this.$store.state.parks.list;
        },
        isToday() {
            return moment(this.centerDate).isSame(moment(), 'day');
        },
        isVisitor() {
            return this.$store.getters['auth/is']('visitor');
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

        handleSetCenterDate(date) {
            const newDate = moment(date.newDate).hour(12).minute(0).toDate();
            this.$emit('setCenterDate', newDate);
        },

        handleSetTodayDate() {
            const now = moment().hour(12).minute(0).toDate();
            this.$emit('setCenterDate', now);
        },

        handleFilterParkChange(e) {
            const { value: parkId } = e.currentTarget;
            this.$emit('filterByPark', parkId);
        },

        handleFilterMissingMaterialChange(hasFilter) {
            this.filters.hasMissingMaterials = hasFilter;
            this.$emit('filterMissingMaterials', hasFilter);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        changePeriod(newPeriod) {
            const start = moment(newPeriod.start);
            const end = moment(newPeriod.end);
            const duration = end.diff(start, 'hours');
            this.centerDate = start.add(duration / 2, 'hours').format();
        },
    },
    render() {
        const {
            $t: __,
            parks,
            filters,
            isToday,
            isVisitor,
            isLoading,
            handleSetTodayDate,
            handleSetCenterDate,
            handleFilterParkChange,
            handleFilterMissingMaterialChange,
            handleRefresh,
        } = this;

        return (
            <div class="CalendarHeader">
                <div class="CalendarHeader__timeline-actions">
                    <div class="CalendarHeader__center-date">
                        <FormField
                            v-model={this.centerDate}
                            name="centerDate"
                            label="page-calendar.center-on"
                            type="date"
                            onChange={handleSetCenterDate}
                        />
                    </div>
                    <button
                        type="button"
                        class="CalendarHeader__button info"
                        title={__('page-calendar.center-on-today')}
                        onClick={handleSetTodayDate}
                        disabled={isToday}
                    >
                        <i class="fas fa-compress-arrows-alt" />
                        <span class="CalendarHeader__button__title">
                            {__('page-calendar.center-on-today')}
                        </span>
                    </button>
                    <button
                        type="button"
                        class="CalendarHeader__button info"
                        title={__('action-refresh')}
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <i class="fas fa-sync-alt" />
                        <span class="CalendarHeader__button__title">
                            {__('action-refresh')}
                        </span>
                    </button>
                </div>
                <div class="CalendarHeader__filters">
                    {parks.length > 1 && (
                        <div
                            class={['CalendarHeader__filter', {
                                'CalendarHeader__filter--active': !!filters.park,
                            }]}
                        >
                            {/* TODO: Changer en select custom. */}
                            <select
                                v-model={filters.park}
                                class="CalendarHeader__filter__select"
                                onChange={handleFilterParkChange}
                            >
                                <option value="">{__('page-calendar.display-all-parks')}</option>
                                {parks.map(({ id, name }) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div
                        class={['CalendarHeader__filter', {
                            'CalendarHeader__filter--active': filters.hasMissingMaterials,
                        }]}
                    >
                        <label class="CalendarHeader__filter__label">
                            {__('page-calendar.event-with-missing-material-only')}
                        </label>
                        <SwitchToggle
                            value={filters.hasMissingMaterials}
                            onInput={handleFilterMissingMaterialChange}
                        />
                    </div>
                </div>
                <div class="CalendarHeader__loading-container">
                    {isLoading && (
                        <div class="CalendarHeader__loading">
                            <i class="fas fa-circle-notch fa-spin" />
                            {__('loading')}
                        </div>
                    )}
                </div>
                <div class="CalendarHeader__actions">
                    {!isVisitor && (
                        <Button type="add" to="/events/new">
                            {__('page-calendar.add-event')}
                        </Button>
                    )}
                </div>
            </div>
        );
    },
};
