import './index.scss';
import moment from 'moment';
import pick from 'lodash/pick';
import config from '@/globals/config';
import { DATE_DB_FORMAT } from '@/globals/constants';
import FormField from '@/components/FormField';
import Fieldset from '@/components/Fieldset';
import EventStore from '../../EventStore';

// @vue/component
export default {
    name: 'EventStep1',
    components: { FormField, Fieldset },
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return {
            datepickerOptions: {
                disabled: { from: null, to: null },
                range: true,
            },
            dates: null,
            duration: 0,
            showIsBillable: config.billingMode === 'partial',
            eventData: {
                title: '',
                start_date: '',
                end_date: '',
                location: '',
                description: '',
                is_billable: config.billingMode !== 'none',
                is_confirmed: false,
            },
            errors: {
                title: null,
                start_date: null,
                end_date: null,
                location: null,
                description: null,
            },
        };
    },
    watch: {
        event() {
            this.initValuesFromEvent();
            this.initDatesFromEvent();
            this.calcDuration();
            this.checkIsSavedEvent();
        },
    },
    mounted() {
        this.initValuesFromEvent();
        this.initDatesFromEvent();
        this.calcDuration();
    },
    methods: {
        initValuesFromEvent() {
            if (!this.event) {
                return;
            }

            this.eventData = {
                title: this.event.title || '',
                start_date: this.event.start_date || '',
                end_date: this.event.end_date || '',
                location: this.event.location || '',
                description: this.event.description || '',
                is_billable: this.event.is_billable,
                is_confirmed: this.event.is_confirmed,
            };
        },

        initDatesFromEvent() {
            if (this.dates) {
                return;
            }

            const {
                start_date: startDate = null,
                end_date: endDate = null,
            } = this.event;

            if (!startDate || !endDate) {
                return;
            }

            this.dates = [startDate, endDate];
        },

        setEventDates() {
            const [startDate, endDate] = this.dates;

            this.eventData.start_date = startDate;
            this.eventData.end_date = endDate;

            this.checkIsSavedEvent();
            this.calcDuration();
        },

        calcDuration() {
            if (!this.dates) {
                return;
            }

            const [startDate, endDate] = this.dates;
            if (startDate && endDate) {
                this.duration = moment(endDate).diff(startDate, 'days') + 1;
            }
        },

        checkIsSavedEvent() {
            EventStore.dispatch('checkIsSaved', { ...this.event || {}, ...this.eventData });
        },

        saveAndBack(e) {
            e.preventDefault();
            this.save({ gotoStep: false });
        },

        saveAndNext(e) {
            e.preventDefault();
            this.save({ gotoStep: 2 });
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

            let request = this.$http.post;
            let route = resource;
            if (id) {
                request = this.$http.put;
                route = `${resource}/${id}`;
            }

            const saveData = pick(this.eventData, [
                'title',
                'start_date',
                'end_date',
                'location',
                'description',
                'is_billable',
                'is_confirmed',
            ]);

            const postData = {
                ...saveData,
                start_date: moment(this.eventData.start_date).startOf('day').format(DATE_DB_FORMAT),
                end_date: moment(this.eventData.end_date).endOf('day').format(DATE_DB_FORMAT),
            };

            request(route, postData)
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
