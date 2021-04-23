import '@robert/vis-timeline/index.scss';
import { Timeline as TimelineCore, DataSet, DataView } from '@robert/vis-timeline';
import { mountVisData } from './_utils';

const Timeline = {
  props: {
    items: {
      type: [Array, DataSet, DataView],
      default: () => [],
    },
    options: {
      type: Object,
    },
  },
  data: () => ({
    data: null,
  }),
  mounted() {
    this.data = mountVisData(this);
    this.timeline = new TimelineCore(
      this.$refs.visualization,
      this.data,
      this.fullOptions,
    );

    // - Binding des événements globaux.
    const globalsEvents = {
      itemover: 'item-over',
      itemout: 'item-out',
      rangechanged: 'range-changed',
      doubleClick: 'double-click',
    };
    Object.entries(globalsEvents).forEach(([originalName, name]) => {
      this.timeline.on(originalName, (props) => { this.$emit(name, props); });
    });

    // - Binding des événements liés aux données.
    const dataEvents = {
      add: 'item-added',
      update: 'item-updated',
      remove: 'item-removed',
    };
    Object.entries(dataEvents).forEach(([originalName, name]) => {
      this.data.on(originalName, (event, properties, senderId) => {
        this.$emit(name, { event, properties, senderId });
      });
    });
  },
  computed: {
    fullOptions() {
      return {
        ...(this.options || {}),
        onMove: (item, callback) => {
          this.$emit('item-moved', item, callback);
        },
        onRemove: (item, callback) => {
          this.$emit('item-remove', item, callback);
        },
      };
    },
  },
  watch: {
    fullOptions: {
      deep: true,
      handler() {
        this.timeline.setOptions(this.fullOptions);
      },
    },
  },
  created() {
    // @see https://github.com/almende/vis/issues/2524
    this.timeline = null;
  },
  beforeDestroy() {
    this.timeline.destroy();
  },
  methods: {
    moveTo(time, options) {
      this.timeline.moveTo(time, options);
    },
  },
  render() {
    return <div ref="visualization"></div>;
  },
};

export default Timeline;
