import Config from '@/config/globalConfig';
import MultipleItem from '@/components/MultipleItem/MultipleItem.vue';
import getPersonItemLabel from '@/utils/getPersonItemLabel';
import formatOptions from '@/utils/formatOptions';
import EventStore from '../EventStore';

export default {
  name: 'EventStep3',
  components: { MultipleItem },
  props: ['event'],
  data() {
    const { technicians } = this.event;

    return {
      technicians: technicians.map(({ position, technician }) => (
        { ...technician, pivot: { position } }
      )),
      techniciansIds: technicians.map(({ technician }) => technician.id),
      techniciansPositions: technicians.map((eventTechnician) => eventTechnician.position),
      fetchParams: { tags: [Config.technicianTagName] },
      errors: {},
    };
  },
  mounted() {
    EventStore.commit('setIsSaved', true);
  },
  methods: {
    updateItems(ids) {
      this.techniciansIds = ids;

      const savedList = this.event.technicians.map(({ technician }) => technician.id);
      const listDifference = ids
        .filter((id) => !savedList.includes(id))
        .concat(savedList.filter((id) => !ids.includes(id)));

      EventStore.commit('setIsSaved', listDifference.length === 0);
    },

    updatePositions(positions) {
      this.techniciansPositions = positions;

      const savedList = this.event.technicians.map((eventTechnician) => eventTechnician.position);
      const listDifference = positions
        .filter((position) => !savedList.includes(position))
        .concat(savedList.filter((position) => !positions.includes(position)));

      EventStore.commit('setIsSaved', listDifference.length === 0);
    },

    formatItemOptions(data) {
      return formatOptions(data, getPersonItemLabel);
    },

    getItemLabel(itemData) {
      return getPersonItemLabel(itemData);
    },

    saveAndBack(e) {
      e.preventDefault();
      this.save({ gotoStep: false });
    },

    saveAndNext(e) {
      e.preventDefault();
      this.save({ gotoStep: 4 });
    },

    displayError(error) {
      this.$emit('error', error);

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },

    save(options) {
      this.$emit('loading');
      const { id, start_date: startDate, end_date: endDate } = this.event;
      const { resource } = this.$route.meta;

      const technicians = this.techniciansIds.map((technicianId, index) => ({
        id: technicianId,
        start_time: startDate,
        end_time: endDate,
        position: this.techniciansPositions[index],
      }));

      this.$http.put(`${resource}/${id}`, { technicians })
        .then(({ data }) => {
          const { gotoStep } = options;
          if (!gotoStep) {
            this.$router.push('/');
            return;
          }
          EventStore.commit('setIsSaved', true);
          this.$emit('updateEvent', data);
          this.$emit('gotoStep', gotoStep);
        })
        .catch(this.displayError);
    },
  },
};
