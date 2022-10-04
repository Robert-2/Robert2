import './index.scss';
import config from '@/globals/config';
import MultipleItem from './MultipleItem';
import EventStore from '../../EventStore';

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

        saveAndBack(e) {
            e.preventDefault();
            this.save({ gotoStep: false });
        },

        saveAndNext(e) {
            e.preventDefault();
            this.save({ gotoStep: 3 });
        },

        displayError(error) {
            this.$emit('error', error);

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                this.errors = { ...details };
            }
        },

        save(options) {
            this.$emit('loading');
            const { id } = this.event;
            const { resource } = this.$route.meta;
            const postData = { beneficiaries: this.beneficiariesIds };

            this.$http.put(`${resource}/${id}`, postData)
                .then(({ data }) => {
                    const { gotoStep } = options;
                    if (!gotoStep) {
                        this.$router.push('/');
                        return;
                    }
                    EventStore.commit('setIsSaved', true);
                    this.$emit('updateEvent', data);
                    this.$emit('gotoStep', gotoStep);
                })
                .catch(this.displayError);
        },
    },
    render() {
        const {
            $t: __,
            event,
            saveAndNext,
            saveAndBack,
            showBillingHelp,
            updateItems,
            getItemLabel,
        } = this;

        return (
            <form class="Form EventStep2" method="POST" onSubmit={saveAndBack}>
                <header class="EventStep2__header">
                    <h1 class="EventStep2__title">{__('page.event-edit.event-beneficiaries')}</h1>
                </header>
                <MultipleItem
                    label={__('beneficiary')}
                    field="full_name"
                    fetchEntity="beneficiaries"
                    selectedItems={event.beneficiaries}
                    createItemPath="/beneficiaries/new"
                    getItemLabel={getItemLabel}
                    onItemsUpdated={updateItems}
                />
                {showBillingHelp && (
                    <p class="EventStep2__help">
                        <i class="fas fa-info-circle" />&nbsp;
                        {__('page.event-edit.beneficiary-billing-help')}
                    </p>
                )}
                <section class="EventStep2__footer">
                    <button class="info" type="submit">
                        <i class="fas fa-arrow-left" />&nbsp;
                        {__('page.event-edit.save-and-back-to-calendar')}
                    </button>
                    <button type="button" class="success" onClick={saveAndNext}>
                        {__('page.event-edit.save-and-continue')}&nbsp;
                        <i class="fas fa-arrow-right" />
                    </button>
                </section>
            </form>
        );
    },
};
