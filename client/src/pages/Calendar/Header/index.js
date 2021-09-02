import './index.scss';
import moment from 'moment';
import FormField from '@/components/FormField';
import SwitchToggle from '@/components/SwitchToggle';
import Help from '@/components/Help';

// @vue/component
export default {
    name: 'CalendarHeader',
    components: { Help, FormField, SwitchToggle },
    props: { isLoading: Boolean },
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
        setCenterDate(date) {
            const newDate = moment(date.newDate).hour(12).minute(0).toDate();
            this.$emit('set-center-date', newDate);
        },

        centerToday() {
            const now = moment().hour(12).minute(0).toDate();
            this.$emit('set-center-date', now);
        },

        refresh() {
            this.$emit('refresh');
        },

        changePeriod(newPeriod) {
            const start = moment(newPeriod.start);
            const end = moment(newPeriod.end);
            const duration = end.diff(start, 'hours');
            this.centerDate = start.add(duration / 2, 'hours').format();
        },

        handleFilterMissingMaterialChange(hasFilter) {
            this.filters.hasMissingMaterials = hasFilter;
            this.$emit('filterMissingMaterials', hasFilter);
        },

        handleFilterParkChange(e) {
            const { value: parkId } = e.currentTarget;
            this.$emit('filterByPark', parkId);
        },
    },
};
