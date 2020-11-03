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
      isVisitor: store.state.user.groupId === 'visitor',
      hasFilterMissingMaterial: false,
    };
  },
  computed: {
    isToday() {
      return moment(this.centerDate).isSame(moment(), 'day');
    },
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
      this.hasFilterMissingMaterial = hasFilter;
      this.$emit('filterMissingMaterials', hasFilter);
    },
  },
};
