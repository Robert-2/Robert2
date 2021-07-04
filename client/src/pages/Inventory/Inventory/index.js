import './index.scss';
import Inventory from '@/components/Inventory';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyMessage from '@/components/EmptyMessage';
import { confirm } from '@/utils/alert';
import { Fragment } from 'vue-fragment';

const InventoryPageInventory = {
  name: 'InventoryPageInventory',
  props: {
    materials: { type: Array, required: true },
    inventory: { type: Object, required: true },
  },
  data() {
    return {
      isSaving: false,
      isTerminating: false,
      quantities: this._normalizeQuantities(this.inventory?.materials),
      saveError: null,
      validationErrors: [],
    };
  },
  watch: {
    inventory(inventory) {
      this.quantities = this._normalizeQuantities(inventory?.materials);
    },
    saveError(newValue) {
      if (newValue !== null) {
        // TODO: Améliorer ça, pas idéal d'avoir à référencer le `.content` ici ...
        document.querySelector('.content').scrollTo(0, 0);
      }
    },
  },
  computed: {
    awaitedMaterials() {
      return this.materials.map((material) => ({
        ...material,
        awaited_quantity: material.stock_quantity,
        awaited_units: material.is_unitary ? material.units : [],
      }));
    },

    isEmpty() {
      return this.awaitedMaterials.length === 0;
    },
  },
  methods: {
    // ------------------------------------------------------
    // -
    // -    Handlers
    // -
    // ------------------------------------------------------

    handleChange(id, quantities) {
      const index = this.quantities.findIndex(({ id: _id }) => id === _id);
      if (index < 0) {
        return;
      }
      this.$set(this.quantities, index, { id, ...quantities });
    },

    handleSave() {
      this.save();
    },

    handleTerminate() {
      this.terminate();
    },

    // ------------------------------------------------------
    // -
    // -    Methods
    // -
    // ------------------------------------------------------

    async save() {
      const { id } = this.inventory;
      if (!id) {
        return;
      }

      if (this.isSaving || this.isTerminating) {
        return;
      }

      this.isSaving = true;
      this.saveError = null;
      this.validationErrors = [];

      try {
        const { data: inventory } = await this.$http.put(`inventories/${id}`, this.quantities);
        this.$emit('change', inventory);
      } catch (error) {
        this._setSaveError(error);
      } finally {
        this.isSaving = false;
      }
    },

    async terminate() {
      const { id } = this.inventory;
      if (!id) {
        return;
      }

      if (this.isSaving || this.isTerminating) {
        return;
      }

      const response = await confirm({
        title: this.$t('page-inventory.confirm-terminate-title'),
        text: this.$t('page-inventory.confirm-terminate-text'),
        confirmButtonText: this.$t('terminate-inventory'),
      });

      if (!response.isConfirmed) {
        return;
      }

      this.isTerminating = true;
      this.saveError = null;
      this.validationErrors = [];

      try {
        await new Promise((resolve) => { setTimeout(resolve, 5000); });
        const { data: inventory } = await this.$http.put(`inventories/${id}/terminate`, this.quantities);
        this.$emit('finished', inventory);
      } catch (error) {
        this._setSaveError(error);
      } finally {
        this.isTerminating = false;
      }
    },

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    _normalizeQuantities(inventoryMaterials = []) {
      return this.materials.map((material) => {
        const inventoryMaterial = inventoryMaterials.find(
          ({ material_id: materialId }) => material.id === materialId,
        );

        const quantities = {
          id: material.id,
          actual: inventoryMaterial?.stock_quantity_current ?? 0,
          broken: inventoryMaterial?.out_of_order_quantity_current ?? 0,
          units: [],
        };

        if (material.is_unitary) {
          quantities.units = material.units.map(({ id, state: originalState }) => {
            const existingUnit = inventoryMaterial?.units.find(
              (_unit) => _unit.material_unit_id === id,
            );

            const isLost = existingUnit?.is_lost_current ?? true;
            const isBroken = existingUnit?.is_broken_current ?? false;
            const state = existingUnit?.state_current ?? originalState;
            return { id, isBroken, isLost, state };
          });
        }

        return quantities;
      });
    },

    _setSaveError(error) {
      const { response } = error;

      if (!response || response?.status !== 400) {
        this.saveError = error;
        this.validationErrors = [];
        return;
      }

      this.saveError = new Error(this.$t('inventory-validation-error'));
      this.validationErrors = error.response?.data?.error?.details ?? [];
    },
  },
  render() {
    const {
      $t: __,
      isEmpty,
      isSaving,
      isTerminating,
      quantities,
      awaitedMaterials,
      saveError,
      validationErrors,
      handleTerminate,
      handleChange,
      handleSave,
    } = this;

    const classNames = ['InventoryPageInventory', {
      'InventoryPageInventory--empty': isEmpty,
    }];

    const render = () => {
      if (isEmpty) {
        return (
          <EmptyMessage
            message={__('page-inventory.no-materials')}
            action={{
              label: __('page-inventory.add-material'),
              url: { name: 'addMaterial', query: { parkId: this.inventory.park_id } },
            }}
          />
        );
      }

      return (
        <Fragment>
          {saveError && <ErrorMessage error={this.saveError} />}
          <Inventory
            locked={isTerminating}
            errors={validationErrors}
            quantities={quantities}
            materials={awaitedMaterials}
            onChange={handleChange}
          />
          <footer class="InventoryPageInventory__footer">
            <button
              type="button"
              class="InventoryPageInventory__footer__action success"
              onClick={handleSave}
              disabled={isSaving || isTerminating}
            >
              {isSaving && <Fragment><i class="fas fa-circle-notch fa-spin" /> {__('saving')}</Fragment>}
              {!isSaving && <Fragment><i class="fas fa-save" /> {__('save-draft')}</Fragment>}
            </button>
            <button
              type="button"
              class="InventoryPageInventory__footer__action info"
              onClick={handleTerminate}
              disabled={isSaving || isTerminating}
              title={__('warning-terminate-inventory')}
            >
              {isTerminating && <Fragment><i class="fas fa-circle-notch fa-spin" /> {__('saving')}</Fragment>}
              {!isTerminating && <Fragment><i class="fas fa-check" /> {__('terminate-inventory')}</Fragment>}
            </button>
          </footer>
        </Fragment>
      );
    };
    return <div class={classNames}>{render()}</div>;
  },
};

export default InventoryPageInventory;
