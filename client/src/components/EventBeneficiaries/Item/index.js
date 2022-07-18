import './index.scss';
import Fragment from '@/components/Fragment';

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
                <router-link
                    title={__('action-edit')}
                    to={{
                        name: 'edit-beneficiary',
                        params: { id: beneficiary.id },
                    }}
                >
                    {beneficiary.full_name}
                </router-link>
                {beneficiary.company && (
                    <Fragment>
                        {' '}
                        <router-link
                            title={__('action-edit')}
                            to={{
                                name: 'edit-company',
                                params: { id: beneficiary.company.id },
                            }}
                        >
                            ({beneficiary.company.legal_name})
                        </router-link>
                    </Fragment>
                )}
            </div>
        );
    },
};
