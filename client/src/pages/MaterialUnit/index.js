import FormField from '@/components/FormField/FormField.vue';
import Help from '@/components/Help/Help.vue';
import store from '@/store';

export default {
  name: 'MaterialUnit',
  components: { FormField, Help },
  data() {
    return {
      help: '',
      error: null,
      isLoading: false,
      material: null,
      ongoingPersist: null,
      unit: {
        serial_number: '',
        park_id: '',
        is_broken: false,
      },
      errors: {
        serial_number: null,
        park_id: null,
        is_broken: null,
      },
    };
  },
  computed: {
    id() {
      let { id } = this.$route.params;
      if (!Number.isNaN(id) && Number.isFinite(parseInt(id, 10))) {
        id = parseInt(id, 10);
      }
      return id && id !== 'new' ? id : null;
    },
    materialId() {
      let { materialId } = this.$route.params;
      if (!Number.isNaN(materialId) && Number.isFinite(parseInt(materialId, 10))) {
        materialId = parseInt(materialId, 10);
      }
      return materialId || null;
    },
    parksOptions() {
      return store.getters['parks/options'];
    },
  },
  mounted() {
    store.dispatch('parks/fetch');

    this.fetchData();
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();

      this.persist();
    },

    async fetchData() {
      this.isLoading = true;
      this.error = null;
      this.help = '';

      try {
        if (!this.id) {
          await this.fetchMaterial();
        } else {
          await this.fetchUnit();
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUnit() {
      if (!this.id) {
        return;
      }

      try {
        const { data } = await this.$http.get(`material-units/${this.id}`);
        const { material, ...unit } = data;

        store.commit('setPageSubTitle', `${unit.serial_number} (${material.name})`);
        this.material = material;
        this.unit = unit;

        if (this.materialId !== material.id) {
          this.$router.replace(`/materials/${material.id}/units/${unit.id}`);
        }
      } catch (error) {
        this.error = error;
      }
    },

    async fetchMaterial() {
      if (!this.materialId) {
        this.$router.replace('/materials');
        return;
      }

      try {
        const { data: material } = await this.$http.get(`materials/${this.materialId}`);
        store.commit('setPageSubTitle', material.name);
        this.material = material;
      } catch (error) {
        this.error = error;

        // - Si le matériel lié n'existe pas (ou autre erreur de type 4xx),
        //   on redirige vers la liste du matériel.
        const code = error.response?.data?.error?.code || 0;
        if (code >= 400 && code <= 499) {
          this.$router.replace('/materials');
        }
      }
    },

    async persist() {
      if (this.ongoingPersist) {
        await this.ongoingPersist;
        return;
      }

      this.isLoading = false;
      this.error = null;
      this.help = '';

      const method = this.id ? 'put' : 'post';
      const url = this.id
        ? `material-units/${this.id}`
        : `materials/${this.materialId}/units`;

      try {
        this.ongoingPersist = this.$http[method](url, { ...this.unit });
        const { data: unit } = await this.ongoingPersist;
        this.help = { type: 'success', text: 'page-material-units.saved' };
        store.commit('setPageSubTitle', `${unit.serial_number} (${this.material.name})`);
        this.unit = unit;

        const redirectRoute = { path: `/materials/${this.material.id}/view`, hash: '#units' };
        setTimeout(() => { this.$router.push(redirectRoute); }, 300);
      } catch (error) {
        this.error = error;

        const { code, details } = error.response?.data?.error || { code: 0, details: {} };
        if (code === 400) {
          this.errors = { ...details };
        }
      } finally {
        this.isLoading = false;
        this.ongoingPersist = null;
      }
    },
  },
};
