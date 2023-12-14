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
            if (!this.isReachable(step)) {
                return;
            }
            this.$emit('openStep', step.id);
        },

        isCurrent(step) {
            return step.id === this.currentStep;
        },

        isReachable(step) {
            const stepIndex = this.steps.findIndex((_step) => _step.id === step.id);
            if (stepIndex < 0) {
                return false;
            }

            // - Si l'événement est sauvegardé, chaque étape est accessible.
            if (![null, undefined].includes(this.event?.id)) {
                return true;
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

        getStepClassNames(step) {
            return {
                'Breadcrumb__step--current': this.isCurrent(step),
                'Breadcrumb__step--reachable': this.isReachable(step),
                'Breadcrumb__step--validated': !this.isCurrent(step) && this.isValidated(step),
            };
        },
    },
    render() {
        const { steps, openStep, isCurrent, isValidated, getStepClassNames } = this;

        return (
            <div class="Breadcrumb">
                {steps.map((step) => (
                    <div
                        class={['Breadcrumb__step', getStepClassNames(step)]}
                        key={step.id}
                        onClick={() => { openStep(step); }}
                    >
                        {isCurrent(step) && <i class="fas fa-arrow-right" />}
                        {!isCurrent(step) && isValidated(step) && <i class="fas fa-check" />}
                        <span class="Breadcrumb__step__id">{step.id} -</span>
                        <span class="Breadcrumb__step__name">{step.name}</span>
                    </div>
                ))}
            </div>
        );
    },
};
