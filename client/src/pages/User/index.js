import Help from '@/components/Help/Help.vue';
import FormField from '@/components/FormField';

export default {
  name: 'User',
  components: { Help, FormField },
  data() {
    return {
      help: 'page-users.help-edit',
      error: null,
      isLoading: false,
      user: {
        id: this.$route.params.id || null,
        pseudo: '',
        email: '',
        password: '',
        group_id: 'member',
        person: {
          first_name: '',
          last_name: '',
          nickname: '',
          phone: '',
          street: '',
          postal_code: '',
          locality: '',
        },
      },
      errors: {
        pseudo: null,
        email: null,
        password: null,
        group_id: null,
        person: {
          first_name: null,
          last_name: null,
          nickname: null,
          phone: null,
          street: null,
          postal_code: null,
          locality: null,
        },
      },
      groupOptions: [
        { value: 'admin', label: 'admin' },
        { value: 'member', label: 'member' },
        { value: 'visitor', label: 'visitor' },
      ],
    };
  },
  mounted() {
    this.getUserData();
  },
  methods: {
    getUserData() {
      const { id } = this.user;
      if (!id || id === 'new') {
        return;
      }

      this.resetHelpLoading();

      const { resource } = this.$route.meta;
      this.$http.get(`${resource}/${id}`)
        .then(({ data }) => {
          this.setUserData(data);
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    saveUser(e) {
      e.preventDefault();
      this.resetHelpLoading();

      const { id } = this.user;
      const { resource } = this.$route.meta;

      let request = this.$http.post;
      let route = 'users/signup';
      if (this.user.id) {
        request = this.$http.put;
        route = `${resource}/${id}`;
      }

      request(route, { ...this.user })
        .then(({ data }) => {
          this.isLoading = false;
          this.help = { type: 'success', text: 'page-users.saved' };
          this.setUserData(data);

          setTimeout(() => {
            this.$router.push('/users');
          }, 300);
        })
        .catch(this.displayError);
    },

    resetHelpLoading() {
      this.help = 'page-users.help-edit';
      this.error = null;
      this.isLoading = true;
    },

    displayError(error) {
      this.help = 'page-users.help-edit';
      this.error = error;
      this.isLoading = false;

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },

    setUserData(data) {
      this.user = data;
      if (!data.person) {
        this.user.person = {
          first_name: '',
          last_name: '',
          nickname: '',
          phone: '',
          street: '',
          postal_code: '',
          locality: '',
        };
      }
      this.$store.commit('setPageSubTitle', this.user.pseudo);
    },
  },
};
