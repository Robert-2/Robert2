import Vue from 'vue';
import store from '@/store';
import Help from '@/components/Help/Help.vue';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'UserSettings',
  components: { Help, FormField },
  data() {
    return {
      help: 'page-settings.help',
      error: null,
      isLoading: false,
      langsOptions: [
        { label: 'french', value: 'FR' },
        { label: 'english', value: 'EN' },
      ],
      settings: {
        language: '',
        auth_token_validity_duration: '',
      },
      errors: {
        language: null,
        auth_token_validity_duration: null,
      },
    };
  },
  mounted() {
    this.getUserSetings();
    store.commit('setPageSubTitle', store.state.user.pseudo);
  },
  methods: {
    getUserSetings() {
      const { id } = store.state.user;
      const { resource } = this.$route.meta;
      this.$http.get(`${resource}/${id}/settings`)
        .then(({ data }) => {
          this.settings = data;
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    saveSettings(e) {
      e.preventDefault();
      const { id } = store.state.user;
      const { resource } = this.$route.meta;
      this.$http.put(`${resource}/${id}/settings`, this.settings)
        .then(({ data }) => {
          this.isLoading = false;
          this.help = { type: 'success', text: 'page-settings.saved' };

          this.settings = data;
          store.commit('user/setLocale', data.language);

          const userLocale = data.language.toLowerCase();
          Vue.i18n.set(userLocale);
          localStorage.setItem('userLocale', userLocale);
        })
        .catch(this.displayError);
    },

    displayError(error) {
      this.help = 'page-settings.help';
      this.error = error;
      this.isLoading = false;

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },
  },
};
