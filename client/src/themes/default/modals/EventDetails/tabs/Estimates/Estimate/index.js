import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import { confirm } from '@/utils/alert';
import apiEstimates from '@/stores/api/estimates';
import { Group } from '@/stores/api/groups';
import formatAmount from '@/utils/formatAmount';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';

// @vue/component
const EventDetailsEstimate = defineComponent({
    name: 'EventDetailsEstimate',
    props: {
        estimate: { type: Object, required: true },
        outdated: { type: Boolean, default: false },
    },
    data: () => ({
        isDeleting: false,
    }),
    computed: {
        normalizedEstimate() {
            const { estimate } = this;
            const date = moment(estimate.date);
            return { ...estimate, date };
        },

        useTaxes() {
            const {
                total_without_taxes: totalWithoutTaxes,
                total_with_taxes: totalWithTaxes,
            } = this.estimate;

            return totalWithoutTaxes.toNumber() !== totalWithTaxes.toNumber();
        },

        userCanDelete() {
            return this.$store.getters['auth/is']([Group.ADMIN, Group.MEMBER]);
        },
    },
    methods: {
        async handleDelete() {
            if (!this.userCanDelete || this.isDeleting) {
                return;
            }

            const { $t: __, estimate: { id } } = this;
            const isConfirmed = await confirm({
                type: 'warning',
                text: __('confirm-delete-estimate'),
                confirmButtonText: __('yes-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isDeleting = true;
            try {
                await apiEstimates.remove(id);

                this.$emit('deleted', id);
                this.$toasted.success(__('estimate-deleted'));
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isDeleting = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            normalizedEstimate,
            isDeleting,
            userCanDelete,
            handleDelete,
            outdated,
            useTaxes,
        } = this;
        const {
            url,
            date,
            currency,
            discount_rate: discountRate,
            total_without_taxes: totalWithoutTaxes,
        } = normalizedEstimate;

        // - Discount text
        const discountText = !discountRate.isZero()
            ? __('discount-rate', { rate: discountRate.toString() })
            : __('without-discount');

        const className = ['EventDetailsEstimate', {
            'EventDetailsEstimate--outdated': outdated,
        }];

        return (
            <div class={className}>
                <Icon name="file-signature" class="EventDetailsEstimate__icon" />
                <div class="EventDetailsEstimate__text">
                    {__('estimate-title', { date: date.format('L'), hour: date.format('HH:mm') })}<br />
                    <strong>{formatAmount(totalWithoutTaxes, currency)} {useTaxes && __('excl-tax')}</strong>
                    {' '}({discountText}).
                </div>
                <div class="EventDetailsEstimate__actions">
                    <Button
                        icon="download"
                        type={!outdated ? 'primary' : 'secondary'}
                        class="EventDetailsEstimate__download"
                        disabled={isDeleting}
                        to={url}
                        external
                        download
                    >
                        {__('download')}
                    </Button>
                    {userCanDelete && (
                        <Button
                            type="delete"
                            class="EventDetailsEstimate__delete"
                            loading={isDeleting}
                            onClick={handleDelete}
                        />
                    )}
                </div>
            </div>
        );
    },
});

export default EventDetailsEstimate;
