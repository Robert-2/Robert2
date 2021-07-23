import './index.scss';
import Config from '@/config/globalConfig';
import MultipleItem from '@/components/MultipleItem/MultipleItem.vue';
import getPersonItemLabel from '@/utils/getPersonItemLabel';
import formatOptions from '@/utils/formatOptions';
import EventStore from '../EventStore';

const EventStep3 = {
  name: 'EventStep3',
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
    // ------------------------------------------------------
    // -
    // -    Handlers
    // -
    // ------------------------------------------------------

    handleSubmit(e) {
      e.preventDefault();

      this.save({ gotoStep: 4 });
    },

    handleSubmitNext(e) {
      e.preventDefault();

      this.save({ gotoStep: 4 });
    },

    handleUpdatedItems(ids) {
      this.techniciansIds = ids;

      const savedList = this.event.technicians.map(({ technician }) => technician.id);
      const listDifference = ids
        .filter((id) => !savedList.includes(id))
        .concat(savedList.filter((id) => !ids.includes(id)));

      EventStore.commit('setIsSaved', listDifference.length === 0);
    },

    handleUpdatedPositions(positions) {
      this.techniciansPositions = positions;

      const savedList = this.event.technicians.map((eventTechnician) => eventTechnician.position);
      const listDifference = positions
        .filter((position) => !savedList.includes(position))
        .concat(savedList.filter((position) => !positions.includes(position)));

      EventStore.commit('setIsSaved', listDifference.length === 0);
    },

    // ------------------------------------------------------
    // -
    // -    Internal
    // -
    // ------------------------------------------------------

    formatItemOptions(data) {
      return formatOptions(data, getPersonItemLabel);
    },

    getItemLabel(itemData) {
      return getPersonItemLabel(itemData);
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
  render() {
    const {
      $t: __,
      technicians,
      fetchParams,
      formatItemOptions,
      getItemLabel,
      handleSubmit,
      handleSubmitNext,
      handleUpdatedItems,
      handleUpdatedPositions,
    } = this;

    return (
      <form class="Form EventStep3" method="POST" onSubmit={handleSubmit}>
        <section class="Form__fieldset">
          <h4 class="Form__fieldset__title">
            {__('page-events.event-technicians')}
          </h4>
          <MultipleItem
            label="technician"
            field="full_name"
            fetchEntity="persons"
            fetchParams={fetchParams}
            selectedItems={technicians}
            createItemPath="/technicians/new"
            formatOptions={formatItemOptions}
            getItemLabel={getItemLabel}
            pivotField="position"
            pivotPlaceholder={__('position-held')}
            onItemsUpdated={handleUpdatedItems}
            onPivotsUpdated={handleUpdatedPositions}
          />
        </section>
        <section class="Form__actions">
          <button class="EventStep3__save-btn info" type="submit">
            <i class="fas fa-arrow-left" />
            {__('page-events.save-and-back-to-calendar')}
          </button>
          <button class="EventStep3__save-btn success" onClick={handleSubmitNext}>
            {__('page-events.save-and-continue')}
            <i class="fas fa-arrow-right" />
          </button>
        </section>
      </form>
    );
  },
};

export default EventStep3;
