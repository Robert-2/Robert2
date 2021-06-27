import './index.scss';
import { Fragment } from 'vue-fragment';
import Config from '@/config/globalConfig';
import SwitchToggle from '@/components/SwitchToggle';

const InventoryItemUnitsItem = {
  name: 'InventoryItemUnitsItem',
  props: {
    unit: { type: Object, required: true },
    locked: { type: Boolean, default: false },
    values: Object,
  },
  computed: {
    id() {
      return this.unit.id;
    },

    isBroken() {
      return this.values?.isBroken ?? false;
    },

    isLost() {
      if (this.isBroken) {
        return false;
      }
      return this.values?.isLost ?? true;
    },

    barcodeUrl() {
      const { baseUrl } = Config;
      return `${baseUrl}/material-units/${this.id}/barcode`;
    },
  },
  methods: {
    handleFoundChange(isFound) {
      const isBroken = isFound ? this.isBroken : false;
      this.$emit('change', this.id, { isLost: !isFound, isBroken });
    },

    handleBrokenChange(isBroken) {
      const isLost = isBroken ? false : this.isLost;
      this.$emit('change', this.id, { isLost, isBroken });
    },

    handleCheckbox(e) {
      e.preventDefault();
      e.target.checked = !this.isLost;

      if (!this.locked) {
        this.handleFoundChange(this.isLost);
      }
    },
  },
  render() {
    const {
      $t: __,
      unit,
      locked,
      isLost,
      isBroken,
      barcodeUrl,
      handleCheckbox,
      handleFoundChange,
      handleBrokenChange,
    } = this;
    const { reference, owner } = unit;

    return (
      <tr class="InventoryItemUnitsItem">
        <td class="InventoryItemUnitsItem__col InventoryItemUnitsItem__col--checkbox">
          <input
            type="checkbox"
            class="InventoryItemUnitsItem__checkbox"
            checked={!isLost}
            onInput={handleCheckbox}
            disabled={locked}
          />
        </td>
        <td class="InventoryItemUnitsItem__col">{reference}</td>
        <td class="InventoryItemUnitsItem__col InventoryItemUnitsItem__col--owner">
          {!!owner && <Fragment><strong>{__('owner-key')}</strong> {owner.full_name}</Fragment>}
        </td>
        <td class="InventoryItemUnitsItem__col InventoryItemUnitsItem__col--actions">
          {!locked && (
            <a
              target="_blank"
              href={barcodeUrl}
              class="button InventoryItemUnits__button"
              download
            >
              <i class="fas fa-barcode" />
            </a>
          )}
        </td>
        <td
          class={[
            'InventoryItemUnitsItem__col',
            'InventoryItemUnitsItem__col--switch',
            'InventoryItemUnitsItem__col--switch--found',
          ]}
        >
          {!locked && <SwitchToggle value={!isLost} onInput={handleFoundChange} hideLabel />}
          {locked && (
            <span
              class={[
                'InventoryItemUnitsItem__state',
                { 'InventoryItemUnitsItem__state--error': isLost },
              ]}
            >
              {!isLost ? __('yes') : __('no')}
            </span>
          )}
        </td>
        <td
          class={[
            'InventoryItemUnitsItem__col',
            'InventoryItemUnitsItem__col--switch',
            'InventoryItemUnitsItem__col--switch--broken',
          ]}
        >
          {!locked && <SwitchToggle value={isBroken} onInput={handleBrokenChange} hideLabel />}
          {locked && (
            <span
              class={[
                'InventoryItemUnitsItem__state',
                { 'InventoryItemUnitsItem__state--error': isBroken },
              ]}
            >
              {isBroken ? __('yes') : __('no')}
            </span>
          )}
        </td>
      </tr>
    );
  },
};

export default InventoryItemUnitsItem;
