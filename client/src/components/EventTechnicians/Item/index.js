import './index.scss';

// @vue/component
export default {
    name: 'EventTechnicianItem',
    props: {
        technician: { type: Object, required: true },
    },
    render() {
        const { $t: __, technician } = this;

        return (
            <div class="EventTechnicianItem">
                <router-link
                    to={{ name: 'view-technician', params: { id: technician.id } }}
                    title={__('action-view')}
                >
                    {technician.full_name}
                </router-link>
            </div>
        );
    },
};
