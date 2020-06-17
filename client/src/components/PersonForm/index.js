import FormField from '@/components/FormField/FormField.vue';
import store from '@/store';

export default {
  name: 'PersonForm',
  components: { FormField },
  props: {
    person: Object,
    errors: Object,
    withCompany: Boolean,
  },
  computed: {
    countriesOptions() {
      return store.getters['countries/options'];
    },

    companiesOptions() {
      return store.getters['companies/options'];
    },
  },
  mounted() {
    store.dispatch('countries/fetch');
    store.dispatch('companies/fetch');
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
