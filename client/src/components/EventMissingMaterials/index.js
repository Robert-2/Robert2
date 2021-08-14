// @vue/component
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
            return { quantity, missing: missingMaterial.missing_quantity };
        },

        displayError(error) {
            this.error = error;
        },
    },
};
