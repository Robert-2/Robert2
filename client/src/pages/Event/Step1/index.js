import moment from 'moment';
import pick from 'lodash.pick';
import Config from '@/config/globalConfig';
import { DATE_DB_FORMAT } from '@/config/constants';
import FormField from '@/components/FormField';
import EventStore from '../EventStore';

// @vue/component
export default {
    name: 'EventStep1',
    components: { FormField },
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return {
            datepickerOptions: {
                disabled: { from: null, to: null },
                isRange: true,
            },
            dates: null,
            duration: 0,
            showIsBillable: Config.billingMode === 'partial',
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
            this.initDatesFromEvent();
            this.calcDuration();
            this.checkIsSavedEvent();
        },
    },
    mounted() {
        this.initDatesFromEvent();
    },
    methods: {
        initDatesFromEvent() {
            if (this.dates) {
                return;
            }

            const { start_date: startDate = null, end_date: endDate = null } = this.event;
            if (!startDate || !endDate) {
                return;
            }

            this.dates = [moment(startDate).toDate(), moment(endDate).toDate()];
        },

        setEventDates() {
            const [startDate, endDate] = this.dates;
            this.event.start_date = moment(startDate).format();
            this.event.end_date = moment(endDate).format();
        },

        calcDuration() {
            const [startDate, endDate] = this.dates;
            if (startDate && endDate) {
                this.duration = moment(endDate).diff(startDate, 'days') + 1;
            }
        },

        checkIsSavedEvent() {
            EventStore.dispatch('checkIsSaved', this.event);
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

            const saveData = pick(this.event, [
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
                start_date: moment(this.event.start_date).startOf('day').format(DATE_DB_FORMAT),
                end_date: moment(this.event.end_date).endOf('day').format(DATE_DB_FORMAT),
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
