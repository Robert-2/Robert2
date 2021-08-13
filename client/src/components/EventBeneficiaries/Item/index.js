import './index.scss';

export default {
    name: 'EventBeneficiaryItem',
    props: {
        beneficiary: Object,
    },
    render() {
        const { $t: __, beneficiary } = this;

        return (
      <div class="EventBeneficiaryItem">
        <router-link
          to={`/beneficiaries/${beneficiary.id}`}
          title={__('action-edit')}
        >
          {beneficiary.full_name}
        </router-link>
        {beneficiary.company && (
          <router-link
            to={`/companies/${beneficiary.company_id}`}
            title={__('action-edit')}
          >
            ({beneficiary.company.legal_name})
          </router-link>
        )}
      </div>
        );
    },
};
