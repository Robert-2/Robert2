import './index.scss';
import invariant from 'invariant';
import Decimal from 'decimal.js';
import { defineComponent } from '@vue/composition-api';
import { Group } from '@/stores/api/groups';
import apiEvents from '@/stores/api/events';
import getEventDiscountRate from '@/utils/getEventDiscountRate';
import Fragment from '@/components/Fragment';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import Form from '../../components/BillingForm';
import Estimate from './Estimate';

// @vue/component
const EventDetailsEstimates = defineComponent({
    name: 'EventDetailsEstimates',
    props: {
        event: {
            type: Object,
            required: true,
            validator: (event) => (
                event.is_billable &&
                event.materials.length > 0
            ),
        },
    },
    data: () => ({
        isCreating: false,
        unsavedDiscountRate: null,
        hasRequestedForm: false,
    }),
    computed: {
        hasBeneficiary() {
            return this.event.beneficiaries.length > 0;
        },

        hasInvoice() {
            return this.event.invoices.length > 0;
        },

        hasEstimate() {
            return this.event.estimates.length > 0;
        },

        userCanEdit() {
            return this.$store.getters['auth/is']([Group.ADMIN, Group.MEMBER]);
        },

        maxDiscountRate() {
            const {
                total_without_discount: totalWithoutDiscount,
                total_discountable: totalDiscountable,
            } = this.event;

            if (totalWithoutDiscount > 0) {
                return (totalDiscountable.times(100))
                    .div(totalWithoutDiscount)
                    .toDecimalPlaces(4, Decimal.ROUND_UP);
            }

            return new Decimal(0);
        },

        minTotalAmount() {
            const {
                total_without_discount: totalWithoutDiscount,
                total_discountable: totalDiscountable,
            } = this.event;

            return totalWithoutDiscount > 0
                ? totalWithoutDiscount.sub(totalDiscountable)
                : new Decimal(0);
        },

        discountRate: {
            get() {
                const { event, unsavedDiscountRate, maxDiscountRate } = this;
                if (unsavedDiscountRate !== null) {
                    return this.unsavedDiscountRate;
                }

                const eventDiscountRate = new Decimal(getEventDiscountRate(event));
                return Decimal.min(eventDiscountRate, maxDiscountRate);
            },
            set(value) {
                this.unsavedDiscountRate = Decimal.min(new Decimal(value), this.maxDiscountRate);
            },
        },

        discountTarget: {
            get() {
                const { event, discountRate, minTotalAmount } = this;
                const { total_without_discount: totalWithoutDiscount } = event;

                const discountAmount = totalWithoutDiscount.times(discountRate / 100);
                const totalAmount = totalWithoutDiscount.sub(discountAmount);
                return Decimal.max(totalAmount, minTotalAmount);
            },
            set(value) {
                const { event, maxDiscountRate } = this;
                const {
                    total_without_discount: totalWithoutDiscount,
                    total_discountable: totalDiscountable,
                } = event;

                if (totalWithoutDiscount <= 0 || totalDiscountable.isZero()) {
                    this.unsavedDiscountRate = 0;
                    return;
                }

                let discountAmount = totalWithoutDiscount.sub(value);
                if (discountAmount.greaterThan(totalDiscountable)) {
                    discountAmount = totalDiscountable;
                }

                const rate = discountAmount.times(100)
                    .div(totalWithoutDiscount)
                    .toDecimalPlaces(4, Decimal.ROUND_UP);

                this.unsavedDiscountRate = Decimal.min(rate, maxDiscountRate);
            },
        },
    },
    created() {
        invariant(
            this.event.is_billable && this.event.materials.length > 0,
            `A non billable event has been passed to <EventDetailsEstimates />`,
        );
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChangeDiscount({ field, value }) {
            if (field === 'amount') {
                this.discountTarget = value;
            } else if (field === 'rate') {
                this.discountRate = value;
            }
        },

        async handleSave() {
            if (this.isCreating) {
                return;
            }

            this.isCreating = true;
            const { $t: __, event: { id }, discountRate } = this;

            try {
                const estimate = await apiEvents.createEstimate(id, discountRate);

                this.hasRequestedForm = false;
                this.unsavedDiscountRate = null;

                this.$emit('created', estimate);
                this.$toasted.success(__('estimate-created'));
            } catch {
                this.$toasted.error(__('errors.unexpected-while-saving'));
            } finally {
                this.isCreating = false;
            }
        },

        handleDeleted(id) {
            this.$emit('deleted', id);
        },

        handleRequestForm() {
            this.hasRequestedForm = true;
        },

        handleCancelForm() {
            if (this.isCreating) {
                return;
            }

            this.hasRequestedForm = false;
            this.unsavedDiscountRate = null;
        },
    },
    render() {
        const {
            $t: __,
            event,
            discountRate,
            discountTarget,
            maxDiscountRate,
            minTotalAmount,
            isCreating,
            hasInvoice,
            hasEstimate,
            hasBeneficiary,
            hasRequestedForm,
            userCanEdit,
            handleSave,
            handleRequestForm,
            handleChangeDiscount,
            handleCancelForm,
            handleDeleted,
        } = this;

        if (!event.is_billable || event.materials.length <= 0) {
            return null;
        }

        const { total_without_taxes: totalWithoutTaxes } = event;

        const renderContent = () => {
            if (!isCreating && !hasRequestedForm) {
                if (!hasEstimate) {
                    if (!hasBeneficiary) {
                        return (
                            <div class="EventDetailsEstimates__not-billable">
                                <h3 class="EventDetailsEstimates__not-billable__title">
                                    <Icon name="exclamation-triangle" /> {__('missing-beneficiary')}
                                </h3>
                                <p class="EventDetailsEstimates__not-billable__text">
                                    {__('not-billable-help')}
                                </p>
                            </div>
                        );
                    }

                    return (
                        <div class="EventDetailsEstimates__no-estimate">
                            <p class="EventDetailsEstimates__no-estimate__text">
                                {__('no-estimate-help')}
                            </p>
                            <p class="EventDetailsEstimates__no-estimate__text">
                                {userCanEdit && __('create-event-estimate-help')}
                                {!userCanEdit && __('contact-someone-to-create-estimate')}
                            </p>
                            {userCanEdit && (
                                <Button type="add" onClick={handleRequestForm}>
                                    {__('click-here-to-create-estimate')}
                                </Button>
                            )}
                        </div>
                    );
                }

                return (
                    <Fragment>
                        <ul class="EventDetailsEstimates__list">
                            {event.estimates.map((estimate, index) => (
                                <li key={estimate.id} class="EventDetailsEstimates__list__item">
                                    <Estimate
                                        key={estimate.id}
                                        estimate={estimate}
                                        outdated={index > 0}
                                        onDeleted={handleDeleted}
                                    />
                                </li>
                            ))}
                        </ul>
                        {(hasBeneficiary && userCanEdit) && (
                            <div class="EventDetailsEstimates__create-new">
                                <p class="EventDetailsEstimates__create-new__text">
                                    {__('modal.event-details.estimates.create-new-help')}
                                </p>
                                <Button
                                    type="add"
                                    class="EventDetailsEstimates__create-new__button"
                                    onClick={handleRequestForm}
                                >
                                    {__('create-new-estimate')}
                                </Button>
                            </div>
                        )}
                    </Fragment>
                );
            }

            return (
                <Fragment>
                    {hasInvoice && (
                        <p class="EventDetailsEstimates__warning-has-invoice">
                            {__('warning-event-has-invoice')}
                        </p>
                    )}
                    <Form
                        discountRate={discountRate}
                        discountTarget={discountTarget}
                        minAmount={minTotalAmount}
                        maxAmount={totalWithoutTaxes}
                        maxRate={maxDiscountRate}
                        beneficiary={event.beneficiaries[0]}
                        saveLabel={__('create-estimate')}
                        onChange={handleChangeDiscount}
                        onSubmit={handleSave}
                        onCancel={handleCancelForm}
                        loading={isCreating}
                    />
                </Fragment>
            );
        };

        return (
            <section class="EventDetailsEstimates">
                {renderContent()}
            </section>
        );
    },
});

export default EventDetailsEstimates;
