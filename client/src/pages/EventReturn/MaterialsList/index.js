import './index.scss';
import Item from './Item';

export default {
  name: 'EventReturnMaterialsList',
  components: { Item },
  props: {
    listData: Array,
    quantities: Array,
    errors: Array,
    isLocked: Boolean,
  },
  computed: {
    isAllReturned() {
      return this.quantities.every(({ out, returned }) => (
        out === returned
      ));
    },

    hasBroken() {
      return this.quantities.some(({ broken }) => (
        broken > 0
      ));
    },
  },
  methods: {
    handleChangeQuantityReturned({ id, quantity }) {
      const index = this.quantities.findIndex(({ id: _id }) => id === _id);
      if (index < 0) {
        return;
      }

      this.$emit('setReturned', { index, quantity });
    },

    handleChangeQuantityBroken({ id, quantity }) {
      const index = this.quantities.findIndex(({ id: _id }) => id === _id);
      if (index < 0) {
        return;
      }

      this.$emit('setBroken', { index, quantity });
    },

    getMaterialQuantities(materialId) {
      return this.quantities.find(({ id }) => id === materialId);
    },

    getError(materialId) {
      if (!this.errors) {
        return null;
      }
      return this.errors.find(({ id }) => id === materialId);
    },
  },
  render() {
    const {
      $t: __,
      listData,
      isLocked,
      getMaterialQuantities,
      getError,
      handleChangeQuantityReturned,
      handleChangeQuantityBroken,
      isAllReturned,
      hasBroken,
    } = this;

    return (
      <div class="EventReturnMaterialsList">
        {isLocked && !isAllReturned && (
          <div class="EventReturnMaterialsList__missing">
            {__('page-event-return.some-material-is-missing')}
          </div>
        )}
        {listData.map(({ id: sectionId, name: sectionName, materials }) => (
          <div key={sectionId} class="EventReturnMaterialsList__section">
            <div class="EventReturnMaterialsList__section__header">
              <h3 class="EventReturnMaterialsList__section__title">
                {sectionId !== 'flat' ? sectionName : ''}
              </h3>
              <h3 class="EventReturnMaterialsList__section__quantity-title">
                {__('quantity-returned')}
              </h3>
              <h3 class="EventReturnMaterialsList__section__quantity-title">
                {__('quantity-out-of-order')}
              </h3>
            </div>
            <ul class="EventReturnMaterialsList__list">
              {materials.map(({ id, name, reference }) => (
                <Item
                  key={id}
                  id={id}
                  reference={reference}
                  name={name}
                  quantities={getMaterialQuantities(id)}
                  error={getError(id)}
                  isLocked={isLocked}
                  onUpdateQuantityReturned={handleChangeQuantityReturned}
                  onUpdateQuantityBroken={handleChangeQuantityBroken}
                />
              ))}
            </ul>
          </div>
        ))}
        {isAllReturned && (
          <div class="EventReturnMaterialsList__all-returned">
            {__('page-event-return.all-material-returned')}
          </div>
        )}
        {hasBroken && (
          <div class="EventReturnMaterialsList__has-broken">
            <i class="fas fa-exclamation-triangle" />{' '}
            {__('page-event-return.some-material-came-back-broken')}
          </div>
        )}
      </div>
    );
  },
};
