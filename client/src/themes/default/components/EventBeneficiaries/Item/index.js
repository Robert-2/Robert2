import './index.scss';
import Fragment from '@/themes/default/components/Fragment';

// @vue/component
export default {
    name: 'EventBeneficiaryItem',
    props: {
        beneficiary: { type: Object, required: true },
    },
    computed: {
        isVisitor() {
            return this.$store.getters['auth/is']('visitor');
        },
    },
    render() {
        const { $t: __, beneficiary, isVisitor } = this;

        return (
            <div class="EventBeneficiaryItem">
                {isVisitor ? beneficiary.full_name : (
                    <router-link
                        title={__('action-edit')}
                        to={{
                            name: 'edit-beneficiary',
                            params: { id: beneficiary.id },
                        }}
                    >
                        {beneficiary.full_name}
                    </router-link>
                )}
                {beneficiary.company && (
                    <Fragment>
                        {' '}
                        {isVisitor ? `(${beneficiary.company.legal_name})` : (
                            <router-link
                                title={__('action-edit')}
                                to={{
                                    name: 'edit-company',
                                    params: { id: beneficiary.company.id },
                                }}
                            >
                                ({beneficiary.company.legal_name})
                            </router-link>
                        )}
                    </Fragment>
                )}
            </div>
        );
    },
};
