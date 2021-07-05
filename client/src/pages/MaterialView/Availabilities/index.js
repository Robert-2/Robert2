import moment from 'moment';
import ModalConfig from '@/config/modalConfig';
import formatTimelineEvent from '@/utils/timeline-event/format';
import Help from '@/components/Help/Help.vue';
import Timeline from '@/components/Timeline';
import EventDetails from '@/components/EventDetails/EventDetails.vue';
import MaterialAvailabilitiesItem from './Item/Item.vue';
import formatEvent from './utils';

const ONE_DAY = 1000 * 3600 * 24;

export default {
  name: 'MaterialViewAvailabilities',
  components: {
    Help,
    Timeline,
    EventDetails,
    MaterialAvailabilitiesItem,
  },
  props: {
    units: Array,
    materialName: String,
  },
  data() {
    const start = moment().subtract(7, 'days').startOf('day');
    const end = moment().add(7, 'days').endOf('day');

    return {
      error: null,
      isLoading: false,
      isModalOpened: false,
      materialId: this.$route.params.id,
      materialEvents: [],
      materialEventsTimeline: [],
      timelineOptions: {
        start,
        end,
        editable: false,
        locale: this.$store.state.i18n.locale,
        height: '100%',
        orientation: 'top',
        zoomMin: ONE_DAY * 7,
        zoomMax: ONE_DAY * 60,
      },
    };
  },
  mounted() {
    this.$store.commit('setPageSubTitle', this.materialName);
    this.getMaterialEventsData();
  },
  methods: {
    getMaterialEventsData() {
      this.error = null;
      this.isLoading = true;
      this.isModalOpened = false;

      this.$http.get(`materials/${this.materialId}/events`)
        .then(({ data }) => {
          this.materialEvents = data.map(formatTimelineEvent);
          this.materialEventsTimeline = data.map(
            (event) => formatEvent(event, this.units, this.$t),
          );
          this.isLoading = false;
        })
        .catch((error) => {
          this.showError(error);
        });
    },

    handleClickItem(eventId) {
      const materialEvent = this.materialEvents.find((event) => event.id === eventId);
      if (!materialEvent) {
        return;
      }

      const date = moment(materialEvent?.start_date);
      this.$refs.MaterialTimeline.moveTo(date);
    },

    openEventModal(eventId) {
      this.isModalOpened = true;
      this.$modal.show(
        EventDetails,
        { eventId },
        ModalConfig,
        {
          'before-close': () => {
            this.getMaterialEventsData();
          },
        },
      );
    },

    handleDoubleClickTimeline(e) {
      // - Here we avoid double-call because of double-trigger of event,
      // - @see visjs bug here: https://github.com/visjs/vis-timeline/issues/301)
      if (this.isModalOpened) {
        return;
      }

      const eventId = e.item;
      if (!eventId) {
        return;
      }

      this.openEventModal(eventId);
    },

    handleClickTimeline(e) {
      const eventId = e.item;
      if (!eventId) {
        return;
      }

      const itemElement = document.querySelector(`[data-item-id="${eventId}"]`);
      if (!itemElement) {
        return;
      }

      this.$refs.MaterialAvailabilitiesList.scroll({
        top: itemElement.offsetTop - 13,
        behavior: 'smooth',
      });
    },

    showError(error) {
      this.error = error;
      this.isLoading = false;
    },
  },
};
