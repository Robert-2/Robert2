import './index.scss';
import { Fragment } from 'vue-fragment';

// @vue/component
export default {
    name: 'EventBeneficiaryItem',
    props: {
        beneficiary: { type: Object, required: true },
    },
    render() {
        const { $t: __, beneficiary } = this;

        return (
            <div class="EventBeneficiaryItem">
                <router-link to={`/beneficiaries/${beneficiary.id}`} title={__('action-edit')}>
                    {beneficiary.full_name}
                </router-link>
                {beneficiary.company && (
                    <Fragment>
                        {' '}
                        <router-link
                            to={`/companies/${beneficiary.company_id}`}
                            title={__('action-edit')}
                        >
                            ({beneficiary.company.legal_name})
                        </router-link>
                    </Fragment>
                )}
            </div>
        );
    },
};
