import Config from '@/config/globalConfig';
import MultipleItem from '@/components/MultipleItem/MultipleItem.vue';
import EventStore from '../EventStore';

export default {
  name: 'EventStep3',
  components: { MultipleItem },
  props: ['event'],
  data() {
    return {
      assigneesIds: this.event.assignees.map((assignee) => assignee.id),
      fetchParams: { tags: [Config.technicianTagName] },
      errors: {},
    };
  },
  mounted() {
    EventStore.commit('setIsSaved', true);
  },
  methods: {
    updateItems(ids) {
      this.assigneesIds = ids;

      const savedList = this.event.beneficiaries.map((benef) => benef.id);
      const listDifference = ids
        .filter((id) => !savedList.includes(id))
        .concat(savedList.filter((id) => !ids.includes(id)));

      EventStore.commit('setIsSaved', listDifference.length === 0);
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
      const { id } = this.event;
      const { resource } = this.$route.meta;
      const postData = { assignees: this.assigneesIds };

      this.$http.put(`${resource}/${id}`, postData)
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
