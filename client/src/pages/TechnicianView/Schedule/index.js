import './index.scss';
import MonthCalendar from '@/components/MonthCalendar';
import Loading from '@/components/Loading';
import formatTechnicianEvent from './utils';

const TechnicianViewSchedule = {
  name: 'TechnicianViewSchedule',
  props: {
    technician: { type: Object, required: true },
  },
  data() {
    return {
      isLoading: false,
      error: null,
      technicianEvents: [],
    };
  },
  computed: {
    events() {
      return this.technicianEvents.map(formatTechnicianEvent);
    },
  },
  mounted() {
    this.fetchEvents();
  },
  methods: {
    async fetchEvents() {
      const { id } = this.$props.technician;

      this.isLoading = true;

      try {
        const { data } = await this.$http.get(`technicians/${id}/events`);
        this.technicianEvents = data;
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },
  },
  render() {
    const { isLoading, error, events } = this;

    const render = () => {
      if (isLoading) {
        return <Loading />;
      }

      if (error) {
        return <ErrorMessage error={error} />;
      }

      return <MonthCalendar events={events} withTotal />;
    };

    return (
      <div class="TechnicianViewSchedule">
        {render()}
      </div>
    );
  },
};

export default TechnicianViewSchedule;
