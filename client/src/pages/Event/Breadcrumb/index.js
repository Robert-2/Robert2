import './index.scss';

// @vue/component
export default {
    name: 'Breadcrumb',
    props: {
        event: { type: Object, required: true },
        steps: { type: Array, required: true },
        currentStep: { type: Number, required: true },
    },
    methods: {
        openStep(step) {
            if (!this.isActive(step)) {
                return;
            }
            this.$emit('openStep', step.id);
        },

        isCurrent(step) {
            return step.id === this.currentStep;
        },

        isActive(step) {
            const stepIndex = this.steps.findIndex((_step) => _step.id === step.id);
            if (stepIndex < 0) {
                return false;
            }

            const previousStep = this.steps[stepIndex - 1] || null;
            return (
                this.isCurrent(step) ||
                this.isValidated(step) ||
                (previousStep && this.isValidated(previousStep))
            );
        },

        isValidated(step) {
            let isValidated = true;
            step.fields.forEach((field) => {
                if (!this.event[field] || this.event[field].length === 0) {
                    isValidated = false;
                }
            });
            return isValidated;
        },
    },
};
