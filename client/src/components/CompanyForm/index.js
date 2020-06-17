import FormField from '@/components/FormField/FormField.vue';
import store from '@/store';

export default {
  name: 'CompanyForm',
  components: { FormField },
  props: ['company', 'errors'],
  computed: {
    countriesOptions() {
      return store.getters['countries/options'];
    },
  },
  mounted() {
    store.dispatch('countries/fetch');
  },
  methods: {
    doSubmit(e) {
      this.$emit('submit', e);
    },

    goBack() {
      this.$router.back();
    },
  },
};
