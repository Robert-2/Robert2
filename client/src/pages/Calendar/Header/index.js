import moment from 'moment';
import store from '@/store';
import FormField from '@/components/FormField/FormField.vue';
import SwitchToggle from '@/components/SwitchToggle/SwitchToggle.vue';
import Help from '@/components/Help/Help.vue';

export default {
  name: 'CalendarHeader',
  components: { Help, FormField, SwitchToggle },
  props: { isLoading: Boolean },
  data() {
    return {
      centerDate: '',
      datepickerOptions: {
        format: 'd MMMM yyyy',
      },
      filters: {
        park: this.$route.query.park || '',
        hasMissingMaterials: false,
      },
      isVisitor: store.state.user.groupId === 'visitor',
    };
  },
  computed: {
    parks() {
      return store.state.parks.list;
    },

    isToday() {
      return moment(this.centerDate).isSame(moment(), 'day');
    },
  },
  mounted() {
    store.dispatch('parks/fetch');
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
