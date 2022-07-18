import './index.scss';
import Help from '@/components/Help';
import EventStore from './EventStore';
import Breadcrumb from './components/Breadcrumb';
import MiniSummary from './components/MiniSummary';
import EventStep1 from './steps/1';
import EventStep2 from './steps/2';
import EventStep3 from './steps/3';
import EventStep4 from './steps/4';
import EventStep5 from './steps/5';

// @vue/component
export default {
    name: 'Event',
    components: {
        Help,
        Breadcrumb,
        MiniSummary,
        EventStep1,
        EventStep2,
        EventStep3,
        EventStep4,
        EventStep5,
    },
    data() {
        const { $t: __ } = this;
        const currentUser = this.$store.state.auth.user;

        return {
            help: 'page.event-edit.help-edit',
            error: null,
            isLoading: false,
            steps: [
                {
                    id: 1,
                    name: __('page.event-edit.event-informations'),
                    fields: ['title', 'start_date', 'end_date'],
                },
                {
                    id: 2,
                    name: __('page.event-edit.event-beneficiaries'),
                    fields: ['beneficiaries'],
                },
                {
                    id: 3,
                    name: __('page.event-edit.event-technicians'),
                    fields: ['technicians'],
                },
                {
                    id: 4,
                    name: __('page.event-edit.event-materials'),
                    fields: ['materials'],
                },
                {
                    id: 5,
                    name: __('page.event-edit.event-summary'),
                    fields: ['title', 'start_date', 'end_date', 'beneficiaries', 'materials'],
                },
            ],
            currentStep: 1,
            event: {
                id: this.$route.params.id || null,
                title: '',
                start_date: this.$route.query.atDate || '',
                end_date: this.$route.query.atDate || '',
                location: '',
                description: '',
                is_confirmed: false,
                user_id: currentUser.id,
                is_billable: true,
                beneficiaries: [],
                technicians: [],
                materials: [],
            },
        };
    },
    computed: {
        isNew() {
            const { id } = this.event;
            return !id || id === 'new';
        },
    },
    mounted() {
        this.getEventData();
        EventStore.commit('reset');
    },
    methods: {
        getEventData() {
            if (this.isNew) {
                return;
            }

            this.startLoading();

            const { id } = this.event;
            const { resource } = this.$route.meta;

            this.$http.get(`${resource}/${id}`)
                .then(({ data }) => {
                    this.setEventData(data, { from: 'get' });
                    this.stopLoading();
                })
                .catch(this.displayError);
        },

        setEventData(data, options = { from: 'save' }) {
            if (options.from === 'get') {
                this.help = 'page.event-edit.help-edit';
            } else {
                this.help = { type: 'success', text: 'page.event-edit.saved' };
            }
            this.error = null;
            this.isLoading = false;
            this.event = data;
            this.$store.commit('setPageSubTitle', this.event.title);
            EventStore.commit('init', this.event);
        },

        openStep(stepId) {
            this.currentStep = stepId;
        },

        startLoading() {
            this.isLoading = true;
        },

        stopLoading() {
            this.isLoading = false;
        },

        displayError(error) {
            this.error = error;
            this.isLoading = false;
        },
    },
};
