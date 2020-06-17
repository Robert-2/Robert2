import EventOverview from '@/components/EventOverview/EventOverview.vue';

export default {
  name: 'EventStep5',
  components: { EventOverview },
  props: { event: Object },
  data() {
    return { isConfirming: false };
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
