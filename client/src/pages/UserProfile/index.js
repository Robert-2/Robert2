import Help from '@/components/Help/Help.vue';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'UserProfile',
  components: { Help, FormField },
  data() {
    const { user } = this.$store.state.auth;

    return {
      help: 'page-profile.help',
      error: null,
      isLoading: false,
      isPasswordEdit: false,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        email: user.email,
        password: '',
        password_confirmation: '',
        group_id: user.groupId,
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
    };
  },
  computed: {
    groupId() {
      return this.$store.state.auth.user.groupId;
    },
  },
  mounted() {
    this.fetch();
  },
  methods: {
    async fetch() {
      const { id } = this.$store.state.auth.user;
      const { resource } = this.$route.meta;

      this.resetHelpLoading();
      try {
        const { data } = await this.$http.get(`${resource}/${id}`);
        this.setUserData(data);
      } catch (error) {
        this.displayError(error);
      } finally {
        this.isLoading = false;
      }
    },

    async save() {
      const { id, password } = this.user;
      if (!id) {
        return;
      }

      const postData = { ...this.user };
      if (password) {
        if (password !== this.user.password_confirmation) {
          this.errors.password = [this.$t('page-profile.password-confirmation-must-match')];
          this.displayError(this.$t('errors.validation'));
          return;
        }
        this.errors.password = null;
        delete postData.password_confirmation;
        delete postData.person;
      }

      const { resource } = this.$route.meta;
      this.resetHelpLoading();
      try {
        const { data } = await this.$http.put(`${resource}/${id}`, postData);
        const text = this.isPasswordEdit ? 'page-profile.password-modified' : 'page-profile.saved';
        this.help = { type: 'success', text };
        this.isPasswordEdit = false;

        this.setUserData(data);
        this.$store.commit('auth/setUserProfile', data);
      } catch (error) {
        this.displayError(error);
      } finally {
        this.isLoading = false;
      }
    },

    resetHelpLoading() {
      this.help = 'page-profile.help';
      this.error = null;
      this.isLoading = true;
    },

    displayError(error) {
      this.help = 'page-profile.help';
      this.error = error;
      this.isLoading = false;

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },

    setUserData(data) {
      let { person } = data;
      if (!person) {
        person = {
          first_name: '',
          last_name: '',
          nickname: '',
          phone: '',
          street: '',
          postal_code: '',
          locality: '',
        };
      }

      this.user = { ...data, person };
    },

    togglePasswordEdit(e) {
      e.preventDefault();
      this.isPasswordEdit = !this.isPasswordEdit;
      if (!this.isPasswordEdit) {
        this.user.password = '';
        this.user.password_confirmation = '';
      }
    },
  },
};
