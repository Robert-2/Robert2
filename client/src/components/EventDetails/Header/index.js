import Config from '@/config/globalConfig';

export default {
  name: 'CalendarEventDetailsHeader',
  props: ['event', 'onSaved', 'onError'],
  data() {
    return {
      isConfirming: false,
      isClosing: false,
      fromToDates: {},
    };
  },
  computed: {
    isPrintable() {
      return (
        this.event.materials
        && this.event.materials.length > 0
        && this.event.beneficiaries
        && this.event.beneficiaries.length > 0
      );
    },
    isVisitor() {
      return this.$store.getters['auth/is']('visitor');
    },
    eventSummaryPdfUrl() {
      const { baseUrl } = Config;
      const { id } = this.event || { id: null };
      return `${baseUrl}/events/${id}/pdf`;
    },
  },
  created() {
    const { event } = this.$props;
    if (!event) {
      return;
    }

    this.fromToDates = {
      from: event.startDate.format('L'),
      to: event.endDate.format('L'),
    };
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
      const url = `events/${id}`;
      this.isConfirming = true;
      this.$http.put(url, { id, is_confirmed: confirmed })
        .then(({ data }) => {
          this.$emit('saved', data);
        })
        .catch((error) => {
          this.$emit('error', error);
        })
        .finally(() => {
          this.isConfirming = false;
        });
    },

    closeEvent() {
      this.setEventClosed(true);
    },

    reopenEvent() {
      this.setEventClosed(false);
    },

    async setEventClosed(close) {
      const { id } = this.$props.event;
      const newState = close
        ? { is_closed: true }
        : { is_closed: false, is_confirmed: false };

      this.isClosing = true;
      try {
        const url = `${this.$route.meta.resource}/${id}`;
        const { data } = await this.$http.put(url, { id, ...newState });
        this.$emit('saved', data);
      } catch (error) {
        this.$emit('error', error);
      } finally {
        this.isClosing = false;
      }
    },
  },
};
