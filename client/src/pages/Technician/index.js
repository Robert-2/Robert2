import Config from '@/config/globalConfig';
import Help from '@/components/Help/Help.vue';
import PersonForm from '@/components/PersonForm/PersonForm.vue';

export default {
  name: 'Technician',
  components: { Help, PersonForm },
  data() {
    return {
      help: 'page-technicians.help-edit',
      error: null,
      isLoading: false,
      person: {
        id: this.$route.params.id || null,
        email: '',
        first_name: '',
        last_name: '',
        nickname: '',
        phone: '',
        street: '',
        postal_code: '',
        locality: '',
        note: '',
      },
      errors: {
        first_name: null,
        last_name: null,
        nickname: null,
        phone: null,
        street: null,
        postal_code: null,
        locality: null,
        note: null,
      },
    };
  },
  mounted() {
    this.getTechnicianData();
  },
  methods: {
    getTechnicianData() {
      const { id } = this.person;
      if (!id || id === 'new') {
        return;
      }

      this.resetHelpLoading();

      const { resource } = this.$route.meta;
      this.$http.get(`${resource}/${id}`)
        .then(({ data }) => {
          this.setPerson(data);
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    saveTechnician(e) {
      e.preventDefault();
      this.resetHelpLoading();

      const { id } = this.person;
      const { resource } = this.$route.meta;

      let request = this.$http.post;
      let route = resource;
      if (id) {
        request = this.$http.put;
        route = `${resource}/${id}`;
      }

      const personData = { ...this.person };
      if (!id) {
        personData.tags = [Config.technicianTagName];
      }

      request(route, personData)
        .then(({ data }) => {
          this.isLoading = false;
          this.help = { type: 'success', text: 'page-technicians.saved' };
          this.setPerson(data);

          setTimeout(() => {
            this.$router.push('/technicians');
          }, 300);
        })
        .catch(this.displayError);
    },

    resetHelpLoading() {
      this.help = 'page-technicians.help-edit';
      this.error = null;
      this.isLoading = true;
    },

    displayError(error) {
      this.help = 'page-technicians.help-edit';
      this.error = error;
      this.isLoading = false;

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },

    setPerson(data) {
      this.person = data;
      const fullName = data.full_name || `${data.first_name} ${data.last_name}`;
      this.$store.commit('setPageSubTitle', fullName);
    },
  },
};
