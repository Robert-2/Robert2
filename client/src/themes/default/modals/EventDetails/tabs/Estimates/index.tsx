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

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';
import type { Estimate as EstimateType } from '@/stores/api/estimates';
import type { DiscountPayload } from '../../components/BillingForm';

type Props = {
    /** L'événement dont on souhaite gérer les devis. */
    event: EventDetails<true>,
};

type Data = {
    isCreating: boolean,
    hasRequestedForm: boolean,
    unsavedDiscountRate: Decimal | null,
};

/** L'onglet "Devis" de la modale de détails d'un événement. */
const EventDetailsEstimates = defineComponent({
    name: 'EventDetailsEstimates',
    props: {
        event: {
            type: Object as PropType<Required<Props>['event']>,
            required: true,
            validator: (event: EventDetails) => (
                event.is_billable &&
                event.materials.length > 0
            ),
        },
    },
    emits: ['created', 'deleted'],
    data: (): Data => ({
        isCreating: false,
        unsavedDiscountRate: null,
        hasRequestedForm: false,
    }),
    computed: {
        hasBeneficiary(): boolean {
            return this.event.beneficiaries.length > 0;
        },

        hasInvoice(): boolean {
            return this.event.invoices.length > 0;
        },

        hasEstimate(): boolean {
            return this.event.estimates.length > 0;
        },

        userCanEdit(): boolean {
            return this.$store.getters['auth/is']([Group.ADMIN, Group.MEMBER]);
        },

        maxDiscountRate(): Decimal {
            const {
                total_without_discount: totalWithoutDiscount,
                total_discountable: totalDiscountable,
            } = this.event;

            if (totalWithoutDiscount.greaterThan(0)) {
                return (totalDiscountable.times(100))
                    .div(totalWithoutDiscount)
                    .toDecimalPlaces(4, Decimal.ROUND_UP);
            }

            return new Decimal(0);
        },

        minTotalAmount(): Decimal {
            const {
                total_without_discount: totalWithoutDiscount,
                total_discountable: totalDiscountable,
            } = this.event;

            return totalWithoutDiscount.greaterThan(0)
                ? totalWithoutDiscount.sub(totalDiscountable)
                : new Decimal(0);
        },

        discountRate: {
            get(): Decimal {
                const { event, maxDiscountRate } = this;
                if (this.unsavedDiscountRate !== null) {
                    return this.unsavedDiscountRate;
                }

                const eventDiscountRate = getEventDiscountRate(event);
                return Decimal.min(eventDiscountRate, maxDiscountRate);
            },
            set(value: Decimal) {
                this.unsavedDiscountRate = Decimal.min(value, this.maxDiscountRate);
            },
        },

        discountTarget: {
            get(): Decimal {
                const { event, minTotalAmount } = this;
                const { total_without_discount: totalWithoutDiscount } = event;

                const discountRate = this.discountRate.div(100);
                const discountAmount = totalWithoutDiscount.times(discountRate);
                const totalAmount = totalWithoutDiscount.sub(discountAmount);
                return Decimal.max(totalAmount, minTotalAmount);
            },
            set(value: Decimal) {
                const { event, maxDiscountRate } = this;
                const {
                    total_without_discount: totalWithoutDiscount,
                    total_discountable: totalDiscountable,
                } = event;

                if (totalWithoutDiscount.lessThanOrEqualTo(0) || totalDiscountable.isZero()) {
                    this.unsavedDiscountRate = new Decimal(0);
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

        handleChangeDiscount({ field, value }: DiscountPayload) {
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

        handleDeleted(id: EstimateType['id']) {
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

        const renderContent = (): JSX.Element => {
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
                            {event.estimates.map((estimate: EstimateType, index: number) => (
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
