import './index.scss';
import Icon from '@/themes/default/components/Icon';

// @vue/component
export default {
    name: 'EventBeneficiaries',
    props: {
        beneficiaries: { type: Array, required: true },
    },
    computed: {
        hasBeneficiary() {
            return this.beneficiaries.length > 0;
        },

        beneficiariesNames() {
            const { beneficiaries } = this;
            return beneficiaries.map(({ company, full_name: fullName }) => (
                `${fullName}${company ? ` (${company.legal_name})` : ''}`
            ));
        },
    },
    render() {
        const { $t: __, hasBeneficiary, beneficiariesNames } = this;

        if (!hasBeneficiary) {
            return null;
        }

        return (
            <div class="EventBeneficiaries">
                <Icon name="address-book" class="EventBeneficiaries__icon" />
                {__('for')}
                <span class="EventBeneficiaries__list">
                    {beneficiariesNames.join(', ')}
                </span>
            </div>
        );
    },
};
