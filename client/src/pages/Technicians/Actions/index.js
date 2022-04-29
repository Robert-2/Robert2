// @vue/component
export default {
    name: 'TechniciansItemActions',
    props: {
        id: { type: Number, required: true },
        isTrashMode: Boolean,
    },
    render() {
        const { $t: __, $props } = this;
        const { isTrashMode, id } = $props;

        if (isTrashMode) {
            return (
                <div>
                    <button
                        type="button"
                        v-tooltip={__('action-restore')}
                        class="info"
                        onClick={() => { this.$emit('restore', id); }}
                    >
                        <i class="fas fa-trash-restore" />
                    </button>
                    <button
                        type="button"
                        v-tooltip={__('action-delete')}
                        class="danger"
                        onClick={() => { this.$emit('remove', id); }}
                    >
                        <i class="fas fa-trash-alt" />
                    </button>
                </div>
            );
        }

        return (
            <div>
                <router-link
                    v-tooltip={__('action-view')}
                    to={`/technicians/${id}/view#infos`}
                    class="button success"
                >
                    <i class="fas fa-eye" />
                </router-link>
                <router-link
                    v-tooltip={__('action-view-schedule')}
                    to={`/technicians/${id}/view#schedule`}
                    class="button success"
                >
                    <i class="far fa-calendar-alt" />
                </router-link>
                <router-link
                    v-tooltip={__('action-edit')}
                    to={`/technicians/${id}`}
                    class="button info"
                >
                    <i class="fas fa-edit" />
                </router-link>
                <button
                    type="button"
                    v-tooltip={__('action-trash')}
                    class="warning"
                    onClick={() => { this.$emit('remove', id); }}
                >
                    <i class="fas fa-trash" />
                </button>
            </div>
        );
    },
};
