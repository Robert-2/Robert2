import { Group } from '@/stores/api/groups';

// @vue/component
export default {
    name: 'EventDetailsTechniciansItem',
    props: {
        technician: { type: Object, required: true },
    },
    computed: {
        isTeamMember() {
            return this.$store.getters['auth/is']([Group.ADMINISTRATION, Group.MANAGEMENT]);
        },
    },
    render() {
        const { $t: __, technician, isTeamMember } = this;

        return (
            <span class="EventDetailsTechniciansItem">
                {!isTeamMember ? technician.full_name : (
                    <router-link
                        to={{ name: 'view-technician', params: { id: technician.id } }}
                        title={__('action-view')}
                    >
                        {technician.full_name}
                    </router-link>
                )}
            </span>
        );
    },
};
