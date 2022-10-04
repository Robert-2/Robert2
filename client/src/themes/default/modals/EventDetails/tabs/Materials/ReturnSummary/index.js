import './index.scss';
import ReturnInventoryItem from './Item';
import { Group } from '@/stores/api/groups';

// @vue/component
export default {
    name: 'EventDetailsReturnSummary',
    components: { ReturnInventoryItem },
    props: {
        eventId: { type: Number, required: true },
        isDone: { type: Boolean, required: true },
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
                    broken: material.pivot.quantity_broken,
                }))
                .filter(({ missing, broken }) => missing > 0 || broken > 0);
        },

        isVisitor() {
            return this.$store.getters['auth/is'](Group.VISITOR);
        },
    },
    render() {
        const { $t: __, eventId, isDone, isVisitor, materialsWithProblem } = this;
        const hasProblems = materialsWithProblem.length > 0;

        return (
            <div class="EventDetailsReturnSummary">
                {hasProblems && (
                    <div class="EventDetailsReturnSummary__title">
                        {__('modal.event-details.materials.problems-on-returned-materials')}
                    </div>
                )}
                {!isDone && (
                    <div class="EventDetailsReturnSummary__not-done">
                        <p>{__('modal.event-details.materials.return-inventory-not-done-yet')}</p>
                        {!isVisitor && (
                            <router-link to={`/event-return/${eventId}`} class="EventDetailsReturnSummary__link">
                                <i class="fas fa-tasks" />{' '}
                                {__('modal.event-details.materials.do-or-terminate-return-inventory')}
                            </router-link>
                        )}
                    </div>
                )}
                {isDone && (
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
                        {!isVisitor && (
                            <router-link to={`/event-return/${eventId}`} class="EventDetailsReturnSummary__link">
                                <i class="fas fa-tasks" /> {__('modal.event-details.materials.view-return-inventory')}
                            </router-link>
                        )}
                    </div>
                )}
            </div>
        );
    },
};
