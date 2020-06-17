export default {
  name: 'EventMissingMaterials',
  props: { eventId: Number },
  data() {
    return {
      hasMissingMaterials: false,
      missingMaterials: [],
      error: null,
    };
  },
  mounted() {
    this.fetchMissingMaterials();
  },
  methods: {
    fetchMissingMaterials() {
      this.$http.get(`events/${this.eventId}/missing-materials`)
        .then(({ data }) => {
          this.missingMaterials = data;
          this.hasMissingMaterials = data.length > 0;
        })
        .catch(this.displayError);
    },

    getMissingCount(missingMaterial) {
      const { quantity } = missingMaterial.pivot;

      const missing = Math.min(
        Math.abs(missingMaterial.remaining_quantity),
        quantity,
      );

      return { quantity, missing };
    },

    displayError(error) {
      this.error = error;
    },
  },
};
