import './index.scss';
import ReturnInventoryItem from './Item';

// @vue/component
export default {
    name: 'ReturnInventorySummary',
    components: { ReturnInventoryItem },
    props: {
        eventId: Number,
        isDone: Boolean,
        materials: Array,
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
            return this.$store.getters['auth/is']('visitor');
        },
    },
    render() {
        const { $t: __, eventId, isDone, isVisitor, materialsWithProblem } = this;
        const hasProblems = materialsWithProblem.length > 0;

        return (
            <div class="ReturnInventorySummary">
                {hasProblems && (
                    <div class="ReturnInventorySummary__title">
                        {__('page-events.problems-on-returned-materials')}
                    </div>
                )}
                {!isDone && (
                    <div class="ReturnInventorySummary__not-done">
                        <p>{__('page-events.return-inventory-not-done-yet')}</p>
                        {!isVisitor && (
                            <router-link to={`/event-return/${eventId}`} class="ReturnInventorySummary__link">
                                <i class="fas fa-tasks" />{' '}
                                {__('page-events.do-or-terminate-return-inventory')}
                            </router-link>
                        )}
                    </div>
                )}
                {isDone && (
                    <div class="ReturnInventorySummary__done">
                        {!hasProblems && (
                            <div class="ReturnInventorySummary__all-ok">
                                {__('page-event-return.all-material-returned')}
                            </div>
                        )}
                        {hasProblems && (
                            <ul class="ReturnInventorySummary__list">
                                {materialsWithProblem.map((itemData) => (
                                    <ReturnInventoryItem key={itemData.id} data={itemData} />
                                ))}
                            </ul>
                        )}
                        <router-link to={`/event-return/${eventId}`} class="ReturnInventorySummary__link">
                            <i class="fas fa-tasks" /> {__('page-events.view-return-inventory')}
                        </router-link>
                    </div>
                )}
            </div>
        );
    },
};
