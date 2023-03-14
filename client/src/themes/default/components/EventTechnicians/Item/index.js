import './index.scss';
import { Group } from '@/stores/api/groups';

// @vue/component
export default {
    name: 'EventTechnicianItem',
    props: {
        technician: { type: Object, required: true },
    },
    computed: {
        isTeamMember() {
            return this.$store.getters['auth/is']([Group.ADMIN, Group.MEMBER]);
        },
    },
    render() {
        const { $t: __, technician, isTeamMember } = this;

        return (
            <div class="EventTechnicianItem">
                {!isTeamMember ? technician.full_name : (
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
