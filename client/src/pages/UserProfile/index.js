import store from '@/store';
import Help from '@/components/Help/Help.vue';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'UserProfile',
  components: { Help, FormField },
  data() {
    return {
      help: 'page-profile.help',
      error: null,
      isLoading: false,
      isPasswordEdit: false,
      user: {
        id: store.state.user.id,
        pseudo: store.state.user.pseudo,
        email: store.state.user.email,
        password: '',
        password_confirmation: '',
        group_id: store.state.user.groupId,
        restricted_parks: [],
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
  computed: { groupId() { return store.state.user.groupId; } },
  mounted() {
    this.getUserData();
    store.commit('setPageSubTitle', store.state.user.pseudo);
  },
  methods: {
    getUserData() {
      const { id } = store.state.user;
      const { resource } = this.$route.meta;

      this.resetHelpLoading();

      this.$http.get(`${resource}/${id}`)
        .then(({ data }) => {
          this.setUserData(data);
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    saveUser(e) {
      e.preventDefault();
      const { id, password } = this.user;
      if (!id) {
        return;
      }

      this.resetHelpLoading();

      const postData = { ...this.user };
      delete postData.restricted_parks;

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
      this.$http.put(`${resource}/${id}`, postData)
        .then(({ data }) => {
          const text = this.isPasswordEdit ? 'page-profile.password-modified' : 'page-profile.saved';
          this.help = { type: 'success', text };
          this.isLoading = false;
          this.isPasswordEdit = false;

          this.setUserData(data);
          store.commit('user/setInfos', data);
        })
        .catch(this.displayError);
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

      store.commit('setPageSubTitle', this.user.pseudo);
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
