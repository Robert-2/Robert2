import Config from '@/config/globalConfig';
import EventOverview from '@/components/EventOverview/EventOverview.vue';

export default {
  name: 'EventStep5',
  components: { EventOverview },
  props: { event: Object },
  data() {
    return { isConfirming: false };
  },
  computed: {
    eventSummaryPdfUrl() {
      const { baseUrl } = Config;
      const { id } = this.event || { id: null };
      return `${baseUrl}/events/${id}/pdf`;
    },
  },
  methods: {
    confirmEvent() {
      this.setEventConfirmation(true);
    },

    unconfirmEvent() {
      this.setEventConfirmation(false);
    },

    setEventConfirmation(confirmed) {
      const { id } = this.$props.event;
      const url = `${this.$route.meta.resource}/${id}`;
      this.isConfirming = true;
      this.$http.put(url, { id, is_confirmed: confirmed })
        .then(({ data }) => {
          this.$emit('updateEvent', data);
        })
        .catch((error) => {
          this.$emit('error', error);
        })
        .finally(() => {
          this.isConfirming = false;
        });
    },
  },
};
