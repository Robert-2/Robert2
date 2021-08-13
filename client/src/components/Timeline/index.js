import '@robert2/vis-timeline/index.scss';
import './index.scss';
import moment from 'moment';
import { Timeline as TimelineCore, DataSet, DataView } from '@robert2/vis-timeline';
import { mountVisData } from './_utils';

const Timeline = {
    name: 'Timeline',
    props: {
        items: {
            type: [Array, DataSet, DataView],
            default: () => [],
        },
        groups: [Array, DataSet, DataView],
        options: Object,
    },
    data: () => ({
        data: null,
        groupData: null,
    }),
    created() {
    // @see https://github.com/almende/vis/issues/2524
        this.timeline = null;
    },
    mounted() {
        this.data = mountVisData(this, 'items', 'data');
        this.groupData = mountVisData(this, 'groups', 'groupData');

        this.timeline = new TimelineCore(
            this.$refs.visualization,
            this.data,
            this.groupData,
            this.fullOptions,
        );

        // - Binding des événements globaux.
        const globalsEvents = {
            itemover: 'itemOver',
            itemout: 'itemOut',
            rangechanged: 'rangeChanged',
            doubleClick: 'doubleClick',
            click: 'click',
        };
        Object.entries(globalsEvents).forEach(([originalName, name]) => {
            this.timeline.on(originalName, (props) => { this.$emit(name, props); });
        });

        // - Binding des événements liés aux données.
        const dataEvents = {
            add: 'itemAdded',
            update: 'itemUpdated',
            remove: 'itemRemoved',
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
                start: this.options.min,
                end: this.options.max,
                xss: {
                    filterOptions: {
                        whiteList: {
                            i: 'class',
                            strong: 'class',
                            em: 'class',
                        },
                    },
                },
                locale: this.$store.state.i18n.locale,
                minHeight: '100%',
                orientation: 'top',
                groupHeightMode: 'fixed',
                tooltip: {
                    followMouse: true,
                    overflowMethod: 'flip',
                },
                editable: {
                    add: false,
                    updateTime: true,
                    updateGroup: false,
                    remove: true,
                    overrideItems: false,
                },
                moment: (date) => moment(date),
                ...(this.options || {}),
                onMove: (item, callback) => {
                    this.$emit('itemMoved', item, callback);
                },
                onRemove: (item, callback) => {
                    this.$emit('itemRemove', item, callback);
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
    beforeDestroy() {
        this.timeline.destroy();
    },
    methods: {
        moveTo(time, options) {
            this.timeline.moveTo(time, options);
        },
    },
    render() {
        const _className = ['Timeline', { 'Timeline--grouped': !!this.groups }];
        return <div class={_className} ref="visualization" />;
    },
};

export default Timeline;
