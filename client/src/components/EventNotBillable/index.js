import './index.scss';

export default {
  name: 'EventNotBillable',
  props: {
    eventId: { type: Number, required: true },
    isEventConfirmed: Boolean,
  },
  data() {
    return {
      isSaving: false,
      error: null,
    };
  },
  computed: {
    userCanEdit() {
      return this.$store.getters['auth/is'](['admin', 'member']);
    },
  },
  methods: {
    async handleClickEnableBilling() {
      try {
        this.isSaving = true;
        this.error = null;

        const { eventId } = this.$props;
        const putData = { is_billable: true };
        const { data } = await this.$http.put(`events/${eventId}`, putData);

        this.$emit('billingEnabled', data);
      } catch (error) {
        this.error = error;
      } finally {
        this.isSaving = false;
      }
    },
  },
  render() {
    const { isEventConfirmed } = this.$props;
    const { $t: __, isSaving, error, userCanEdit, handleClickEnableBilling } = this;

    return (
      <div class="EventNotBillable">
        <p><i class="fas fa-ban" /> {__('event-not-billable')}</p>
        {!isEventConfirmed && userCanEdit && (
          <button onClick={handleClickEnableBilling} class="success" disabled={isSaving}>
            {isSaving && (<span><i class="fas fa-circle-notch fa-spin" /> {__('saving')}</span>)}
            {!isSaving && __('enable-billable-event')}
          </button>
        )}
        {error && <ErrorMessage error={error} />}
      </div>
    );
  },
};
