import store from '@/store';

export default {
  name: 'CalendarEventDetailsHeader',
  props: ['event', 'onSaved', 'onError'],
  data() {
    return {
      isConfirming: false,
      fromToDates: {},
      isVisitor: store.state.user.groupId === 'visitor',
    };
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

    printEvent() {
      console.log('TODO: PRINT EVENT');
    },

    setEventConfirmation(confirmed) {
      const { id } = this.$props.event;
      const url = `${this.$route.meta.resource}/${id}`;
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
  },
};
