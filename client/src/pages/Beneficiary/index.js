import Config from '@/config/globalConfig';
import Help from '@/components/Help/Help.vue';
import PersonForm from '@/components/PersonForm/PersonForm.vue';

const storageKeyWIP = 'WIP-newBeneficiary';

export default {
  name: 'Beneficiary',
  components: { Help, PersonForm },
  data() {
    return {
      help: 'page-beneficiaries.help-edit',
      error: null,
      isLoading: false,
      person: {
        id: this.$route.params.id || null,
        email: '',
        first_name: '',
        last_name: '',
        reference: '',
        company_id: '',
        nickname: '',
        phone: '',
        street: '',
        postal_code: '',
        locality: '',
        country_id: '',
        note: '',
      },
      errors: {
        first_name: null,
        last_name: null,
        reference: null,
        nickname: null,
        phone: null,
        street: null,
        postal_code: null,
        locality: null,
        note: null,
      },
    };
  },
  computed: {
    isNew() {
      const { id } = this.person;
      return !id || id === 'new';
    },
  },
  mounted() {
    this.getBeneficiaryData();
  },
  methods: {
    getBeneficiaryData() {
      if (this.isNew) {
        this.initWithStash();
        return;
      }

      this.resetHelpLoading();

      const { id } = this.person;
      const { resource } = this.$route.meta;

      this.$http.get(`${resource}/${id}`)
        .then(({ data }) => {
          this.setPerson(data);
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    saveBeneficiary(e) {
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
        personData.tags = [Config.beneficiaryTagName];
      }

      request(route, personData)
        .then(({ data }) => {
          this.isLoading = false;
          this.help = { type: 'success', text: 'page-beneficiaries.saved' };
          this.setPerson(data);
          this.flushStashedData();

          setTimeout(() => {
            this.$router.push('/beneficiaries');
          }, 300);
        })
        .catch(this.displayError);
    },

    resetHelpLoading() {
      this.help = 'page-beneficiaries.help-edit';
      this.error = null;
      this.isLoading = true;
    },

    displayError(error) {
      this.help = 'page-beneficiaries.help-edit';
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

    handleFormChange() {
      if (!this.isNew) {
        return;
      }

      const stashedData = JSON.stringify(this.person);
      localStorage.setItem(storageKeyWIP, stashedData);
    },

    initWithStash() {
      if (!this.isNew) {
        return;
      }

      const stashedData = localStorage.getItem(storageKeyWIP);
      if (!stashedData) {
        return;
      }

      this.person = JSON.parse(stashedData);
    },

    flushStashedData() {
      localStorage.removeItem(storageKeyWIP);
    },
  },
};
