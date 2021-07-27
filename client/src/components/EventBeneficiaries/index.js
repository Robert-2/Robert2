import './index.scss';
import EventBeneficiaryItem from './Item';

export default {
  name: 'EventBeneficiaries',
  props: {
    beneficiaries: Array,
    warningEmptyText: String,
  },
  render() {
    const { $t: __, beneficiaries, warningEmptyText } = this;

    return (
      <div class="EventBeneficiaries">
        {beneficiaries.length === 0 && warningEmptyText && (
          <div class="EventBeneficiaries__nobody">
            <i class="fas fa-exclamation-circle EventBeneficiaries__icon" /> {warningEmptyText}
          </div>
        )}
        {beneficiaries.length > 0 && (
          <div class="EventBeneficiaries__list">
            <span>
              <i class="fas fa-address-book" /> {__('for')}
            </span>
            {beneficiaries.map((beneficiary) => (
              <EventBeneficiaryItem key={beneficiary.id} beneficiary={beneficiary} />
            ))}
          </div>
        )}
      </div>
    );
  },
};
