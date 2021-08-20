import Config from '@/config/globalConfig';
import MultipleItem from '@/components/MultipleItem/MultipleItem.vue';
import getPersonItemLabel from '@/utils/getPersonItemLabel';
import formatOptions from '@/utils/formatOptions';
import EventStore from '../EventStore';

// @vue/component
export default {
    name: 'EventStep2',
    components: { MultipleItem },
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return {
            beneficiariesIds: this.event.beneficiaries.map((benef) => benef.id),
            showBillingHelp: Config.billingMode !== 'none',
            fetchParams: { tags: [Config.beneficiaryTagName] },
            errors: {},
        };
    },
    mounted() {
        EventStore.commit('setIsSaved', true);
    },
    methods: {
        updateItems(ids) {
            this.beneficiariesIds = ids;

            const savedList = this.event.beneficiaries.map((benef) => benef.id);
            const listDifference = ids
                .filter((id) => !savedList.includes(id))
                .concat(savedList.filter((id) => !ids.includes(id)));

            EventStore.commit('setIsSaved', listDifference.length === 0);
        },

        formatItemOptions(data) {
            return formatOptions(data, getPersonItemLabel);
        },

        getItemLabel(itemData) {
            return getPersonItemLabel(itemData);
        },

        saveAndBack(e) {
            e.preventDefault();
            this.save({ gotoStep: false });
        },

        saveAndNext(e) {
            e.preventDefault();
            this.save({ gotoStep: 3 });
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
            const postData = { beneficiaries: this.beneficiariesIds };

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
