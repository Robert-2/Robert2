import VueSelect from 'vue-select';
import { debounce } from 'debounce';
import { DEBOUNCE_WAIT } from '@/config/constants';
import formatOptions from '@/utils/formatOptions';

export default {
  name: 'MultipleItem',
  components: { VueSelect },
  props: {
    fetchEntity: String,
    fetchParams: Object,
    label: String,
    field: String,
    selectedItems: Array,
    createItemPath: String,
  },
  data() {
    const defaultItem = { value: null, label: this.$t('please-choose') };

    return {
      itemsIds: this.selectedItems.map((item) => item.id),
      notSavedSelectedItem: [...this.selectedItems],
      minSearchCharacters: 2,
      askNewItem: false,
      fieldOptions: [],
      newItem: defaultItem,
      defaultItem,
    };
  },
  computed: {
    selectableOptions() {
      return this.fieldOptions.filter(
        (option) => !this.itemsIds.includes(option.value),
      );
    },
  },
  methods: {
    handleSearch(searchTerm, loading) {
      if (searchTerm.length < this.minSearchCharacters) {
        return;
      }
      loading(true);
      this.search(loading, searchTerm);
    },

    // - We're not using arrow function here because we need access to 'this'
    // eslint-disable-next-line func-names
    search: debounce(function (loading, search) {
      const params = {
        ...this.fetchParams,
        search,
        limit: 10,
      };
      this.$http.get(this.fetchEntity, { params })
        .then(({ data }) => {
          const items = formatOptions(
            data.data,
            ['last_name', 'first_name', '−', 'company.legal_name', '−', 'locality'],
          );
          this.fieldOptions = items;
        })
        .catch(console.error)
        .finally(() => {
          loading(false);
        });
    }, DEBOUNCE_WAIT),

    getItemLabel(itemData) {
      const {
        tempLabel,
        first_name: firstName,
        last_name: lastName,
        company,
        locality,
      } = itemData;

      if (tempLabel) {
        return tempLabel;
      }

      let label = `${lastName} ${firstName}`;
      if (company) {
        label += ` − ${company.legal_name}`;
      }
      if (locality) {
        label += ` − ${locality}`;
      }
      return label;
    },

    startAddItem(e) {
      e.preventDefault();
      this.askNewItem = true;
    },

    insertNewItem() {
      if (!this.newItem || !this.newItem.value) {
        return;
      }

      const { value, label } = this.newItem;
      this.itemsIds.push(value);
      this.notSavedSelectedItem.push({
        id: value,
        tempLabel: label.replace(/\s−$/, ''),
      });

      this.askNewItem = false;
      this.newItem = this.defaultItem;

      this.$emit('itemsUpdated', this.itemsIds);
    },

    cancelNewItem(e) {
      e.preventDefault();
      this.askNewItem = false;
      this.newItem = this.defaultItem;
    },

    removeItem(id) {
      this.itemsIds = this.itemsIds.filter(
        (_id) => _id !== id,
      );
      this.notSavedSelectedItem = this.notSavedSelectedItem.filter(
        (item) => item.id !== id,
      );
      this.$emit('itemsUpdated', this.itemsIds);
    },
  },
};
