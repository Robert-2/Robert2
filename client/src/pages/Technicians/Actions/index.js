export default {
  name: 'TechniciansItemActions',
  props: {
    id: { type: Number, required: true },
    isTrashMode: Boolean,
    remove: Function,
    restore: Function,
  },
  render() {
    const { $t: __, $props } = this;
    const { isTrashMode, id, remove, restore } = $props;

    if (isTrashMode) {
      return (
        <div>
          <button
            vTooltip={__('action-restore')}
            class="item-actions__button info"
            onClick={restore(id)}
          >
            <i class="fas fa-trash-restore" />
          </button>
          <button
            v-tooltip={__('action-delete')}
            class="item-actions__button danger"
            onClick={remove(id)}
          >
            <i class="fas fa-trash-alt" />
          </button>
        </div>
      );
    }

    return (
      <div>
        <router-link
          vTooltip={__('action-view')}
          to={`/technicians/${id}/view#infos`}
          custom
        >
          {({ navigate }) => (
            <button onClick={navigate} class="item-actions__button success">
              <i class="fas fa-eye" />
            </button>
          )}
        </router-link>
        <router-link
          vTooltip={__('action-edit')}
          to={`/technicians/${id}`}
          custom
        >
          {({ navigate }) => (
            <button onClick={navigate} class="item-actions__button info">
              <i class="fas fa-edit" />
            </button>
          )}
        </router-link>
        <button
          vTooltip={__('action-trash')}
          class="item-actions__button warning"
          onClick={remove(id)}
        >
          <i class="fas fa-trash" />
        </button>
      </div>
    );
  },
};
