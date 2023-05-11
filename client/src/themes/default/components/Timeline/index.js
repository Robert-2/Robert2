/* eslint-disable import/order */
import '@loxya/vis-timeline/index.scss';
import './index.scss';
/* eslint-enable import/order */

import moment from 'moment';
import styleObjectToString from 'style-object-to-css-string';
import { Timeline as TimelineCore, DataSet, DataView } from '@loxya/vis-timeline';
import Color from '@/utils/color';
import { getLocale } from '@/globals/lang';
import dateRoundMinutes from '@/utils/dateRoundMinutes';
import Loading from '@/themes/default/components/Loading';
import { mountVisData } from './_utils';

// @vue/component
export default {
    name: 'Timeline',
    props: {
        items: {
            type: Array,
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
                locale: getLocale(),
                locales: {
                    [getLocale()]: {
                        current: __('current'),
                        time: __('time'),
                        deleteSelected: __('deleted-selected'),
                    },
                },
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
                ...this.options,
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

        formattedItems() {
            return (this.items ?? []).map((rawItem) => {
                const {
                    style: rawStyle = {},
                    color: rawColor = null,
                    className: rawClassName = [],
                    ...item
                } = rawItem;

                const style = typeof rawStyle === 'object' ? { ...rawStyle } : {};
                const className = typeof rawClassName === 'string'
                    ? rawClassName.trim().replaceAll('  ', ' ').split(' ')
                    : rawClassName;

                if (rawColor !== null && rawColor !== undefined) {
                    const color = new Color(rawColor);

                    if (!('--timeline-item-color' in style)) {
                        style['--timeline-item-color'] = color.toHexString();
                    }

                    const colorType = color.isDark() ? 'dark' : 'light';
                    className.push(
                        `Timeline__item--with-custom-color`,
                        `Timeline__item--with-${colorType}-color`,
                    );
                }

                className.unshift('Timeline__item');
                return {
                    ...item,
                    style: styleObjectToString(style),
                    className: className.join(' '),
                };
            });
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
        this.data = mountVisData(this, 'formattedItems', 'data');
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
            doubletap: 'doubleClick',
            click: 'click',
        };
        Object.entries(globalsEvents).forEach(([originalName, name]) => {
            this.timeline.on(originalName, (props) => {
                // - L'événement `doubleClick` n'est pas trigger correctement dans tous les
                //   cas sur mobile, on observe donc l'événement `doubletap`, mais comme celui-ci
                //   est bas niveau, on est obligé de récupérer les propriétés customs de
                //   l'événement "à la main".
                // @see https://github.com/visjs/vis-timeline/blob/v7.4.7/lib/timeline/Core.js#L160
                // @see https://github.com/visjs/vis-timeline/blob/v7.4.7/lib/timeline/Timeline.js#L165
                // @see https://github.com/visjs/vis-timeline/blob/v7.4.7/lib/timeline/component/item/Item.js#L203
                if (originalName === 'doubletap') {
                    props = this.timeline.getEventProperties(props);
                }
                this.$emit(name, props);
            });
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

        zoomIn(percentage, options) {
            this.timeline.zoomIn(percentage, options);
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
