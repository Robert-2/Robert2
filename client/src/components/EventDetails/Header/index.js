import Config from '@/config/globalConfig';
import getMainIcon from '@/utils/timeline-event/getMainIcon';

export default {
  name: 'CalendarEventDetailsHeader',
  props: ['event', 'onSaved', 'onError'],
  data() {
    return {
      isConfirming: false,
      isArchiving: false,
      fromToDates: {},
    };
  },
  computed: {
    mainIcon() {
      const withProblem = this.event.hasMissingMaterials || this.event.hasNotReturnedMaterials;
      return withProblem ? 'exclamation-triangle' : getMainIcon(this.event);
    },

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

    canModify() {
      const { isPast, isConfirmed, isInventoryDone } = this.event;

      return !(
        this.isVisitor
        || (isPast && isInventoryDone)
        || (isPast && isConfirmed)
      );
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

    archiveEvent() {
      this.setEventArchived(true);
    },

    unarchiveEvent() {
      this.setEventArchived(false);
    },

    async setEventArchived(isArchived) {
      this.isArchiving = true;

      const { id } = this.$props.event;

      try {
        const url = `${this.$route.meta.resource}/${id}`;
        const { data } = await this.$http.put(url, { id, is_archived: isArchived });
        this.$emit('saved', data);
      } catch (error) {
        this.$emit('error', error);
      } finally {
        this.isArchiving = false;
      }
    },
  },
};
