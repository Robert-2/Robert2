import './index.scss';
import invariant from 'invariant';
import Decimal from 'decimal.js';
import { defineComponent } from '@vue/composition-api';
import getEventDiscountRate from '@/utils/getEventDiscountRate';
import apiEvents from '@/stores/api/events';
import { Group } from '@/stores/api/groups';
import Fragment from '@/components/Fragment';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import Link from '@/themes/default/components/Link';
import Form from '../../components/BillingForm';
import Invoice, { InvoiceLayout } from './Invoice';

// @vue/component
const EventDetailsInvoices = defineComponent({
    name: 'EventDetailsInvoices',
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
        invoice() {
            return [...this.event.invoices].shift() ?? null;
        },

        previousInvoices() {
            return this.event.invoices.slice(1);
        },

        hasBeneficiary() {
            return this.event.beneficiaries.length > 0;
        },

        hasEstimate() {
            return this.event.estimates.length > 0;
        },

        hasInvoice() {
            return this.invoice !== null;
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
            `A non billable event has been passed to <EventDetailsInvoices />`,
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
                const invoice = await apiEvents.createInvoice(id, discountRate);

                this.hasRequestedForm = false;
                this.unsavedDiscountRate = null;

                this.$emit('created', invoice);
                this.$toasted.success(__('invoice-created'));
            } catch {
                this.$toasted.error(__('errors.unexpected-while-saving'));
            } finally {
                this.isCreating = false;
            }
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
            invoice,
            previousInvoices,
            discountRate,
            discountTarget,
            maxDiscountRate,
            minTotalAmount,
            isCreating,
            hasEstimate,
            hasRequestedForm,
            handleSave,
            hasInvoice,
            userCanEdit,
            hasBeneficiary,
            handleRequestForm,
            handleChangeDiscount,
            handleCancelForm,
        } = this;

        if (!event.is_billable || event.materials.length <= 0) {
            return null;
        }

        const { total_without_taxes: totalWithoutTaxes } = event;

        const renderContent = () => {
            if (!isCreating && !hasRequestedForm) {
                if (!hasInvoice) {
                    if (!hasBeneficiary) {
                        return (
                            <div class="EventDetailsInvoices__not-billable">
                                <h3 class="EventDetailsInvoices__not-billable__title">
                                    <Icon name="exclamation-triangle" /> {__('missing-beneficiary')}
                                </h3>
                                <p class="EventDetailsInvoices__not-billable__text">
                                    {__('not-billable-help')}
                                </p>
                            </div>
                        );
                    }

                    return (
                        <div class="EventDetailsInvoices__no-invoice">
                            <p class="EventDetailsInvoices__no-invoice__text">
                                {__('no-invoice-help')}
                            </p>
                            <p class="EventDetailsInvoices__no-invoice__text">
                                {userCanEdit && __('create-event-invoice-help')}
                                {!userCanEdit && __('contact-someone-to-create-invoice')}
                            </p>
                            {userCanEdit && (
                                <Button
                                    type="add"
                                    class="EventDetailsInvoices__no-invoice__button"
                                    onClick={handleRequestForm}
                                >
                                    {__('click-here-to-create-invoice')}
                                </Button>
                            )}
                        </div>
                    );
                }

                return (
                    <Fragment>
                        <div class="EventDetailsInvoices__current-invoice">
                            <Invoice invoice={invoice} />
                        </div>
                        {(hasBeneficiary && userCanEdit) && (
                            <div class="EventDetailsInvoices__regenerate">
                                <p class="EventDetailsInvoices__regenerate__text">
                                    {__('modal.event-details.invoice.regenerate-help')}
                                </p>
                                <Link
                                    icon="sync"
                                    class="EventDetailsInvoices__regenerate__link"
                                    onClick={handleRequestForm}
                                >
                                    {__('click-here-to-regenerate-invoice')}
                                </Link>
                            </div>
                        )}
                        {previousInvoices.length > 0 && (
                            <div class="EventDetailsInvoices__previous-invoices">
                                <h3 class="EventDetailsInvoices__previous-invoices__title">
                                    {__('previous-invoices')}
                                </h3>
                                <ul class="EventDetailsInvoices__previous-invoices__list">
                                    {previousInvoices.map((previousInvoice) => (
                                        <li
                                            key={previousInvoice.id}
                                            class="EventDetailsInvoices__previous-invoices__list__item"
                                        >
                                            <Invoice
                                                invoice={previousInvoice}
                                                layout={InvoiceLayout.HORIZONTAL}
                                                outdated
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Fragment>
                );
            }

            return (
                <Fragment>
                    {!hasEstimate && (
                        <p class="EventDetailsInvoices__warning-no-estimate">
                            {__('warning-no-estimate-before-billing')}
                        </p>
                    )}
                    <Form
                        discountRate={discountRate}
                        discountTarget={discountTarget}
                        minAmount={minTotalAmount}
                        maxAmount={totalWithoutTaxes}
                        maxRate={maxDiscountRate}
                        beneficiary={event.beneficiaries[0]}
                        saveLabel={__('create-invoice')}
                        onChange={handleChangeDiscount}
                        onSubmit={handleSave}
                        onCancel={handleCancelForm}
                        loading={isCreating}
                    />
                </Fragment>
            );
        };

        return (
            <section class="EventDetailsInvoices">
                {renderContent()}
            </section>
        );
    },
});

export default EventDetailsInvoices;
