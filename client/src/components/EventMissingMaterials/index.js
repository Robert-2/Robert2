import './index.scss';

// @vue/component
export default {
    name: 'EventMissingMaterials',
    props: {
        eventId: { type: Number, required: true },
    },
    data() {
        return {
            hasMissingMaterials: false,
            missingMaterials: [],
            error: null,
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            try {
                const { data } = await this.$http.get(`events/${this.eventId}/missing-materials`);

                this.missingMaterials = data;
                this.hasMissingMaterials = data.length > 0;
            } catch (error) {
                this.error = error;
            }
        },

        getMissingCount(missingMaterial) {
            const { quantity } = missingMaterial.pivot;
            return { quantity, missing: missingMaterial.missing_quantity };
        },
    },
};
