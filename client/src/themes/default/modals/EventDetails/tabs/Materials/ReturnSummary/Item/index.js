import './index.scss';

// @vue/component
export default {
    name: 'EventDetailsReturnSummaryItem',
    props: {
        data: { type: Object, required: true },
    },
    render() {
        const { $t: __, data } = this;
        const { id, name, out, returned, missing, broken } = data;

        return (
            <li class="EventDetailsReturnSummaryItem">
                <div class="EventDetailsReturnSummaryItem__name">
                    <router-link
                        to={`/materials/${id}/view`}
                        class="EventDetailsReturnSummaryItem__name__link"
                    >
                        {name}
                    </router-link>
                </div>
                <div class="EventDetailsReturnSummaryItem__missing">
                    {missing > 0 && __(
                        'modal.event-details.materials.not-returned-material-count',
                        { out, returned, missing },
                        returned,
                    )}
                </div>
                <div class="EventDetailsReturnSummaryItem__broken">
                    {broken > 0 && __(
                        'modal.event-details.materials.broken-material-count',
                        { broken },
                        broken,
                    )}
                </div>
            </li>
        );
    },
};
