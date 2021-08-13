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
                        v-tooltip={__('action-restore')}
                        class="item-actions__button info"
                        onClick={() => { this.$emit('restore', id); }}
                    >
                        <i class="fas fa-trash-restore" />
                    </button>
                    <button
                        v-tooltip={__('action-delete')}
                        class="item-actions__button danger"
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
                    class="button success item-actions__button"
                >
                    <i class="fas fa-eye" />
                </router-link>
                <router-link
                    v-tooltip={__('action-edit')}
                    to={`/technicians/${id}`}
                    class="button info item-actions__button"
                >
                    <i class="fas fa-edit" />
                </router-link>
                <button
                    v-tooltip={__('action-trash')}
                    class="item-actions__button warning"
                    onClick={() => { this.$emit('remove', id); }}
                >
                    <i class="fas fa-trash" />
                </button>
            </div>
        );
    },
};
