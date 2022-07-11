import '@robert2/vis-timeline/index.scss';
import './index.scss';
import moment from 'moment';
import { Timeline as TimelineCore, DataSet, DataView } from '@robert2/vis-timeline';
import dateRoundMinutes from '@/utils/dateRoundMinutes';
import Loading from '@/components/Loading';
import { mountVisData } from './_utils';

// @vue/component
export default {
    name: 'Timeline',
    props: {
        items: {
            type: [Array, DataSet, DataView],
            default: () => [],
        },
        groups: {
            type: [Array, DataSet, DataView],
            default: undefined,
        },
        options: {
            type: Object,
            default: undefined,
        },
        minutesGrid: {
            type: Number,
            default: undefined,
        },
    },
    data: () => ({
        data: null,
        groupData: null,
        loading: true,
    }),
    computed: {
        fullOptions() {
            const { $t: __ } = this;

            return {
                start: this.options?.min,
                end: this.options?.max,
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
                    delay: 300,
                },
                tooltipOnItemUpdateTime: {
                    template: ({ start, end }) => [
                        __('update-in-progress'),
                        __('from-date-to-date', {
                            from: moment(start).format('L HH:mm'),
                            to: moment(end).format('L HH:mm'),
                        }),
                    ].join('\n'),
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
                onMoving: (item, callback) => {
                    const { minutesGrid } = this.$props;
                    if (!minutesGrid) {
                        callback(item);
                    }
                    const { start: freeStart, end: freeEnd } = item;
                    const start = dateRoundMinutes(freeStart, minutesGrid);
                    const end = dateRoundMinutes(freeEnd, minutesGrid);
                    callback({ ...item, start, end });
                },
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

        // Vu qu'il n'y a pas de moyen correct d'observer quand la timeline a terminé de rendre,
        // On ajoute un MutationObserver et on passe en `loading=false` lorsqu'il y a un changement
        // dans les enfants du conteneur de la timeline.
        this.domObserver = new MutationObserver(() => {
            this.loading = false;
            this.domObserver.disconnect();
        });
        this.domObserver.observe(this.$refs.visualization, { childList: true });

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
    beforeDestroy() {
        this.timeline.destroy();

        if (this.domObserver) {
            this.domObserver.disconnect();
        }
    },
    methods: {
        moveTo(time, options) {
            this.timeline.moveTo(time, options);
        },
    },
    render() {
        const { loading, groups } = this;

        const _className = ['Timeline', {
            'Timeline--grouped': !!groups,
        }];

        return (
            <div class={_className}>
                {loading && <Loading class="Timeline__loading" />}
                <div class="Timeline__content" ref="visualization" />
            </div>
        );
    },
};
