export default {
  name: 'MaterialsListUnit',
  props: {
    data: Object,
    isSelected: Boolean,
  },
  mounted() {
    this.$store.dispatch('parks/fetch');
  },
  computed: {
    park() {
      const parkId = this.data.park_id;
      return this.$store.getters['parks/parkName'](parkId);
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

      if (this.data.is_lost) {
        classNames.push('MaterialsListUnit--lost');
      }

      return classNames.join(' ');
    },

    unitState() {
      const { state } = this.data;
      return state ? state.name : null;
    },
  },
  methods: {
    handleToggle() {
      if (!this.isAvailable && !this.isSelected) {
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
