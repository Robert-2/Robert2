import FormField from '@/components/FormField';

export default {
  name: 'PersonForm',
  components: { FormField },
  props: {
    person: Object,
    errors: Object,
    withCompany: Boolean,
    withReference: Boolean,
  },
  computed: {
    countriesOptions() {
      return this.$store.getters['countries/options'];
    },

    companiesOptions() {
      return this.$store.getters['companies/options'];
    },
  },
  mounted() {
    this.$store.dispatch('countries/fetch');
    this.$store.dispatch('companies/fetch');
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
