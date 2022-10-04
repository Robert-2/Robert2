import './index.scss';

// @vue/component
export default {
    name: 'EventTechnicianItem',
    props: {
        technician: { type: Object, required: true },
    },
    computed: {
        isVisitor() {
            return this.$store.getters['auth/is']('visitor');
        },
    },
    render() {
        const { $t: __, technician, isVisitor } = this;

        return (
            <div class="EventTechnicianItem">
                {isVisitor ? technician.full_name : (
                    <router-link
                        to={{ name: 'view-technician', params: { id: technician.id } }}
                        title={__('action-view')}
                    >
                        {technician.full_name}
                    </router-link>
                )}
            </div>
        );
    },
};
