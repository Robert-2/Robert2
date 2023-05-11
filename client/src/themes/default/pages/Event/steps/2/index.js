import './index.scss';
import config from '@/globals/config';
import apiEvents from '@/stores/api/events';
import MultipleItem from './MultipleItem';
import EventStore from '../../EventStore';
import { ApiErrorCode } from '@/stores/api/@codes';

// @vue/component
export default {
    name: 'EventStep2',
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return {
            beneficiariesIds: this.event.beneficiaries.map((benef) => benef.id),
            showBillingHelp: config.billingMode !== 'none',
            errors: {},
        };
    },
    mounted() {
        EventStore.commit('setIsSaved', true);
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e) {
            e.preventDefault();

            this.saveAndGoToStep(3);
        },

        handlePrevClick(e) {
            e.preventDefault();

            this.saveAndGoToStep(1);
        },

        handleNextClick(e) {
            e.preventDefault();

            this.saveAndGoToStep(3);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        updateItems(ids) {
            this.beneficiariesIds = ids;

            const savedList = this.event.beneficiaries.map((benef) => benef.id);
            const listDifference = ids
                .filter((id) => !savedList.includes(id))
                .concat(savedList.filter((id) => !ids.includes(id)));

            EventStore.commit('setIsSaved', listDifference.length === 0);
        },

        getItemLabel(beneficiary) {
            const { full_name: fullName, reference, company } = beneficiary;

            let label = fullName;
            if (reference && reference.length > 0) {
                label += ` (${reference})`;
            }
            if (company && company.legal_name.length > 0) {
                label += ` − ${company.legal_name}`;
            }

            return label;
        },

        async saveAndGoToStep(nextStep) {
            this.$emit('loading');

            const { id } = this.event;
            const postData = { beneficiaries: this.beneficiariesIds };

            try {
                const data = await apiEvents.update(id, postData);
                EventStore.commit('setIsSaved', true);
                this.$emit('updateEvent', data);
                this.$emit('gotoStep', nextStep);
            } catch (error) {
                this.$emit('error', error);

                const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                if (code === ApiErrorCode.VALIDATION_FAILED) {
                    this.errors = { ...details };
                }
            } finally {
                this.$emit('stopLoading');
            }
        },
    },
    render() {
        const {
            $t: __,
            event,
            showBillingHelp,
            updateItems,
            getItemLabel,

            handleSubmit,
            handlePrevClick,
            handleNextClick,
        } = this;

        return (
            <form class="EventStep2" method="POST" onSubmit={handleSubmit}>
                <header class="EventStep2__header">
                    <h1 class="EventStep2__title">{__('page.event-edit.event-beneficiaries')}</h1>
                    {showBillingHelp && (
                        <p class="EventStep2__help">
                            <i class="fas fa-info-circle" />&nbsp;
                            {__('page.event-edit.beneficiary-billing-help')}
                        </p>
                    )}
                </header>
                <MultipleItem
                    label={__('beneficiary')}
                    fetchEntity="beneficiaries"
                    selectedItems={event.beneficiaries}
                    createItemPath="/beneficiaries/new"
                    getItemLabel={getItemLabel}
                    onItemsUpdated={updateItems}
                />
                <section class="EventStep2__actions">
                    <button type="submit" class="button info" onClick={handlePrevClick}>
                        <i class="fas fa-arrow-left" />&nbsp;
                        {__('page.event-edit.save-and-go-to-prev-step')}
                    </button>
                    <button type="submit" class="button success" onClick={handleNextClick}>
                        {__('page.event-edit.save-and-go-to-next-step')}&nbsp;
                        <i class="fas fa-arrow-right" />
                    </button>
                </section>
            </form>
        );
    },
};
