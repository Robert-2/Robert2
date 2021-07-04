import './index.scss';
import { Fragment } from 'vue-fragment';
import Config from '@/config/globalConfig';
import SwitchToggle from '@/components/SwitchToggle';

const InventoryItemUnitsItem = {
  name: 'InventoryItemUnitsItem',
  props: {
    unit: { type: Object, required: true },
    locked: { type: [Boolean, Array], default: false },
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

    state() {
      if (this.isLost) {
        return this.unit.state;
      }
      return this.values?.state ?? this.unit.state;
    },

    readableState() {
      return this.$store.getters['unitStates/unitStateName'](this.state) || '?';
    },

    isStateLocked() {
      if (Array.isArray(this.locked)) {
        return this.locked.includes('unit-state');
      }
      return this.locked;
    },

    barcodeUrl() {
      const { baseUrl } = Config;
      return `${baseUrl}/material-units/${this.id}/barcode`;
    },

    statesOptions() {
      return this.$store.getters['unitStates/options'];
    },
  },
  mounted() {
    this.$store.dispatch('unitStates/fetch');
  },
  methods: {
    handleFoundChange(isFound) {
      const isBroken = isFound ? this.isBroken : false;
      this.$emit('change', this.id, { isLost: !isFound, isBroken, state: this.state });
    },

    handleBrokenChange(isBroken) {
      const isLost = isBroken ? false : this.isLost;
      this.$emit('change', this.id, { isLost, isBroken, state: this.state });
    },

    handleStateChange(e) {
      const { isLost, isBroken } = this;
      if (this.isStateLocked || isLost) {
        this.$forceUpdate();
        return;
      }

      const { value } = e.currentTarget;
      this.$emit('change', this.id, { isLost, isBroken, state: value });
      this.$forceUpdate();
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
      state,
      isLost,
      isBroken,
      readableState,
      isStateLocked,
      barcodeUrl,
      statesOptions,
      handleCheckbox,
      handleStateChange,
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
            disabled={locked === true}
          />
        </td>
        <td class="InventoryItemUnitsItem__col">{reference}</td>
        <td class="InventoryItemUnitsItem__col InventoryItemUnitsItem__col--owner">
          {!!owner && <Fragment><strong>{__('owner-key')}</strong> {owner.full_name}</Fragment>}
        </td>
        <td class="InventoryItemUnitsItem__col InventoryItemUnitsItem__col--state InventoryItemUnitsItem__state">
          <strong class="InventoryItemUnitsItem__state__label">{__('state')}&nbsp;:</strong>
          {isStateLocked && <span class="InventoryItemUnitsItem__state__value">{readableState}</span>}
          {!isStateLocked && (
            <select
              value={state}
              disabled={isLost}
              onChange={handleStateChange}
              class="InventoryItemUnitsItem__state__select"
            >
              {statesOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        </td>
        <td class="InventoryItemUnitsItem__col InventoryItemUnitsItem__col--actions">
          {locked !== true && (
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
          {locked !== true && (
            <SwitchToggle value={!isLost} onInput={handleFoundChange} hideLabel />
          )}
          {locked === true && (
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
          {locked !== true && (
            <SwitchToggle value={isBroken} onInput={handleBrokenChange} hideLabel />
          )}
          {locked === true && (
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
