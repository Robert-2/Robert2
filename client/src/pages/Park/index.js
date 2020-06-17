import store from '@/store';
import Help from '@/components/Help/Help.vue';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'Material',
  components: { Help, FormField },
  data() {
    return {
      help: 'page-parks.help-edit',
      error: null,
      isLoading: false,
      park: {
        id: this.$route.params.id || null,
        name: '',
        street: '',
        postal_code: '',
        locality: '',
        country_id: '',
        note: '',
      },
      errors: {
        name: null,
        street: null,
        postal_code: null,
        locality: null,
        country_id: null,
      },
    };
  },
  computed: {
    countriesOptions() {
      return store.getters['countries/options'];
    },
  },
  mounted() {
    store.dispatch('countries/fetch');
    this.getParkData();
  },
  methods: {
    getParkData() {
      const { id } = this.park;
      if (!id || id === 'new') {
        return;
      }

      this.resetHelpLoading();

      const { resource } = this.$route.meta;
      this.$http.get(`${resource}/${id}`)
        .then(({ data }) => {
          this.setParkData(data);
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    savePark(e) {
      e.preventDefault();
      this.resetHelpLoading();

      const { id } = this.park;
      const { resource } = this.$route.meta;

      let request = this.$http.post;
      let route = resource;
      if (id) {
        request = this.$http.put;
        route = `${resource}/${id}`;
      }

      request(route, { ...this.park })
        .then(({ data }) => {
          this.isLoading = false;
          this.help = { type: 'success', text: 'page-parks.saved' };
          this.setParkData(data);
          store.dispatch('parks/refresh');

          setTimeout(() => {
            this.$router.push('/parks');
          }, 300);
        })
        .catch(this.displayError);
    },

    resetHelpLoading() {
      this.help = 'page-parks.help-edit';
      this.error = null;
      this.isLoading = true;
    },

    displayError(error) {
      this.help = 'page-parks.help-edit';
      this.error = error;
      this.isLoading = false;

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },

    setParkData(data) {
      this.park = data;
      store.commit('setPageSubTitle', this.park.name);
    },
  },
};
