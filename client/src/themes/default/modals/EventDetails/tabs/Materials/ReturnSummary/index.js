import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { Group } from '@/stores/api/groups';
import Button from '@/themes/default/components/Button';
import ReturnInventoryItem from './Item';

// @vue/component
const EventDetailsReturnSummary = {
    name: 'EventDetailsReturnSummary',
    components: { ReturnInventoryItem },
    props: {
        eventId: { type: Number, required: true },
        materials: { type: Array, required: true },
    },
    computed: {
        materialsWithProblem() {
            return this.materials
                .map((material) => ({
                    ...material,
                    out: material.pivot.quantity,
                    returned: material.pivot.quantity_returned,
                    missing: material.pivot.quantity - material.pivot.quantity_returned,
                    broken: material.pivot.quantity_returned_broken,
                }))
                .filter(({ missing, broken }) => missing > 0 || broken > 0);
        },

        isTeamMember() {
            return this.$store.getters['auth/is']([Group.MEMBER, Group.ADMIN]);
        },
    },
    render() {
        const { $t: __, eventId, isTeamMember, materialsWithProblem } = this;
        const hasProblems = materialsWithProblem.length > 0;

        return (
            <div class="EventDetailsReturnSummary">
                {hasProblems && (
                    <div class="EventDetailsReturnSummary__title">
                        {__('modal.event-details.materials.problems-on-returned-materials')}
                    </div>
                )}
                <div class="EventDetailsReturnSummary__done">
                    {!hasProblems && (
                        <div class="EventDetailsReturnSummary__all-ok">
                            {__('modal.event-details.materials.all-material-returned')}
                        </div>
                    )}
                    {hasProblems && (
                        <ul class="EventDetailsReturnSummary__list">
                            {materialsWithProblem.map((itemData) => (
                                <ReturnInventoryItem key={itemData.id} data={itemData} />
                            ))}
                        </ul>
                    )}
                    {isTeamMember && (
                        <Button
                            type="primary"
                            icon="tasks"
                            to={{ name: 'event-return-inventory', params: { id: eventId } }}
                        >
                            {__('modal.event-details.materials.view-return-inventory')}
                        </Button>
                    )}
                </div>
            </div>
        );
    },
};

export default defineComponent(EventDetailsReturnSummary);
