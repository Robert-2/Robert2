import './EventReturn.scss';
import moment from 'moment';
import Swal from 'sweetalert2/dist/sweetalert2';
import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';
import formatAmount from '@/utils/formatAmount';
import EventReturnHeader from './Header';
import MaterialsList from './MaterialsList';

const EventReturnPage = {
  name: 'EventReturn',
  components: { EventReturnHeader, MaterialsList },
  data() {
    return {
      help: 'page-event-return.help',
      error: null,
      validationErrors: null,
      isLoading: false,
      isSaving: false,
      isTerminating: false,
      displayGroup: 'categories',
      event: {
        id: this.$route.params.id || null,
        materials: [],
        beneficiaries: [],
      },
      endDate: null,
      quantities: [],
    };
  },
  computed: {
    listData() {
      const categoryNameGetter = this.$store.getters['categories/categoryName'];
      const parkNameGetter = this.$store.getters['parks/parkName'];

      switch (this.displayGroup) {
        case 'categories':
          return dispatchMaterialInSections(this.event.materials, 'category_id', categoryNameGetter);
        case 'parks':
          return dispatchMaterialInSections(this.event.materials, 'park_id', parkNameGetter);
        default:
          return [
            { id: 'flat', name: null, materials: this.event.materials },
          ];
      }
    },

    isPast() {
      return this.endDate ? this.endDate.isBefore(new Date()) : false;
    },

    isDone() {
      return !!this.event.is_return_inventory_done;
    },
  },
  mounted() {
    this.getEventData();
  },
  methods: {
    formatAmount(amount) {
      return formatAmount(amount);
    },

    async getEventData() {
      const { id } = this.event;
      if (!id) {
        return;
      }

      this.isLoading = true;

      try {
        const { data } = await this.$http.get(`events/${id}`);
        this.setEventData(data);
      } catch (error) {
        this.event.id = null;
        this.displayError(error);
      }
    },

    setEventData(data) {
      this.help = 'page-event-return.help';
      this.error = null;
      this.validationErrors = null;
      this.isLoading = false;
      this.isSaving = false;
      this.isTerminating = false;

      this.event = data;
      this.endDate = moment(data.end_date);

      this.initQuantities();

      this.$store.commit('setPageSubTitle', data.title);
    },

    initQuantities() {
      const { materials } = this.event;

      this.quantities = materials.map(({ id, pivot }) => ({
        id,
        out: pivot.quantity,
        returned: pivot.quantity_returned || 0,
        broken: pivot.quantity_broken || 0,
      }));
    },

    setReturned({ index, quantity }) {
      this.quantities[index].returned = quantity;
    },

    setBroken({ index, quantity }) {
      this.quantities[index].broken = quantity;
    },

    setDisplayGroup(group) {
      this.displayGroup = group;
    },

    async save() {
      const { id } = this.event;
      if (!id) {
        return;
      }

      this.isSaving = true;
      this.validationErrors = null;

      try {
        const { data } = await this.$http.put(`events/${id}/return`, this.quantities);
        this.setEventData(data);
      } catch (error) {
        this.displayError(error);
      }
    },

    async terminate() {
      const { id } = this.event;
      if (!id) {
        return;
      }

      const hasBroken = this.quantities.some(({ broken }) => broken > 0);

      const response = await Swal.fire({
        title: this.$t('page-event-return.confirm-terminate-title'),
        text: hasBroken
          ? this.$t('page-event-return.confirm-terminate-text-with-broken')
          : this.$t('page-event-return.confirm-terminate-text'),
        icon: 'warning',
        showCancelButton: true,
        customClass: {
          confirmButton: 'swal2-confirm--info',
        },
        confirmButtonText: this.$t('page-event-return.terminate-inventory'),
        cancelButtonText: this.$t('cancel'),
      });

      if (!response.isConfirmed) {
        return;
      }

      this.isSaving = true;
      this.isTerminating = true;
      this.validationErrors = null;

      try {
        const { data } = await this.$http.put(`events/${id}/terminate`, this.quantities);
        this.setEventData(data);
      } catch (error) {
        this.displayError(error);
      }
    },

    displayError(error) {
      this.isLoading = false;
      this.isSaving = false;
      this.isTerminating = false;

      if (error.response.status === 400) {
        this.error = new Error(this.$t('page-event-return.validation-error'));
        this.validationErrors = error.response.data.error.details;
        return;
      }

      this.error = error;
    },
  },
};

export default EventReturnPage;
