import Config from '@/config/globalConfig';
import Layout from './components/Layout/Layout.vue';

export default {
  name: 'Login',
  components: { Layout },
  data() {
    let type = 'default';
    let text = this.$t('page-login.welcome');

    const { hash } = this.$route;
    switch (hash) {
      case '#bye':
        type = 'success';
        text = this.$t('page-login.bye');
        break;
      case '#expired':
        type = 'error';
        text = this.$t('page-login.error.expired-session');
        break;
      case '#restricted':
        type = 'error';
        text = this.$t('page-login.error.not-allowed');
        break;
      default:
        break;
    }

    return {
      message: { type, text, isLoading: false },
      credentials: { identifier: '', password: '' },
    };
  },
  methods: {
    async login() {
      this.message = {
        type: 'default',
        text: this.$t('page-login.please-wait'),
        isLoading: true,
      };

      try {
        await this.$store.dispatch('auth/login', { ...this.credentials });

        const lastVisited = window.localStorage.getItem('lastVisited');
        const redirect = (!lastVisited || lastVisited === '/login') ? '/' : lastVisited;
        this.$router.replace(redirect || '/');
      } catch (error) {
        if (!error.response) {
          this.errorMessage({ code: 0, message: 'network error' });
          return;
        }

        const { status, data } = error.response;
        const code = (status === 404 && !data.error) ? 0 : 404;
        const message = data.error ? data.error.message : 'network error';
        this.errorMessage({ code, message });
      }
    },

    errorMessage(error) {
      let text = this.$t('errors.api-unreachable');
      if (error.code === 404) {
        text = this.$t('page-login.error.bad-infos');
      }

      this.message = {
        type: 'error',
        text,
        isLoading: false,
      };
    },
  },
};
