import store from '@/store';

export default {
  name: 'MaterialsListUnit',
  props: {
    data: Object,
    isSelected: Boolean,
  },
  mounted() {
    store.dispatch('parks/fetch');
  },
  computed: {
    park() {
      const parkId = this.data.park_id;
      return store.getters['parks/parkName'](parkId);
    },
    isAvailable() {
      return this.data.is_available;
    },
    classNames() {
      const classNames = ['MaterialsListUnit'];

      if (this.isSelected) {
        classNames.push('MaterialsListUnit--selected');
      }

      if (!this.isAvailable) {
        classNames.push('MaterialsListUnit--unavailable');
      }

      if (this.data.is_broken) {
        classNames.push('MaterialsListUnit--broken');
      }

      return classNames.join(' ');
    },
  },
  methods: {
    handleToggle() {
      if (!this.isAvailable) {
        return;
      }
      this.$emit('toggle');
    },
    handleCheckbox(e) {
      e.preventDefault();
      e.target.checked = this.isSelected;
    },
  },
};
