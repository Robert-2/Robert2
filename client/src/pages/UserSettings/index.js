import Vue from 'vue';
import Help from '@/components/Help/Help.vue';
import FormField from '@/components/FormField';

export default {
  name: 'UserSettings',
  components: { Help, FormField },
  data() {
    return {
      help: 'page-user-settings.help',
      error: null,
      isLoading: true,
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
    this.fetch();
  },
  methods: {
    async fetch() {
      const { id } = this.$store.state.auth.user;
      this.isLoading = true;

      try {
        const { data } = await this.$http.get(`users/${id}/settings`);
        this.settings = data;
      } catch (error) {
        this.displayError(error);
      } finally {
        this.isLoading = false;
      }
    },

    async save() {
      const { id } = this.$store.state.auth.user;
      this.isLoading = true;

      try {
        const { data } = await this.$http.put(`users/${id}/settings`, this.settings);
        this.settings = data;
        this.help = { type: 'success', text: 'page-user-settings.saved' };

        const userLocale = data.language.toLowerCase();
        localStorage.setItem('userLocale', userLocale);
        this.$store.commit('auth/setLocale', data.language);
        Vue.i18n.set(userLocale);
      } catch (error) {
        this.displayError(error);
      } finally {
        this.isLoading = false;
      }
    },

    displayError(error) {
      this.help = 'page-user-settings.help';
      this.error = error;

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },
  },
};
