import './index.scss';
import { Tabs, Tab } from 'vue-slim-tabs';
import Help from '@/components/Help';
import Infos from './Infos';
import Documents from './Documents';
import Units from './Units';
import Availabilities from './Availabilities';

// @vue/component
export default {
    name: 'MaterialView',
    components: {
        Tabs,
        Tab,
        Help,
        Infos,
        Documents,
        Units,
        Availabilities,
    },
    data() {
        return {
            help: '',
            error: null,
            isLoading: false,
            tabsIndexes: ['#infos', '#units', '#documents', '#availabilities'],
            selectedTabIndex: 0,
            material: {
                id: this.$route.params.id,
                attributes: [],
            },
        };
    },
    created() {
        const { hash } = this.$route;
        if (hash && this.tabsIndexes.includes(hash)) {
            this.selectedTabIndex = this.tabsIndexes.findIndex((tab) => tab === hash);
        }
    },
    mounted() {
        this.$store.dispatch('categories/fetch');

        this.fetchMaterial();
    },
    methods: {
        onSelectTab(e, index) {
            this.selectedTabIndex = index;
            this.$router.push(this.tabsIndexes[index]);
        },

        fetchMaterial() {
            const { id } = this.material;

            this.resetHelpLoading();

            const { resource } = this.$route.meta;
            this.$http.get(`${resource}/${id}`)
                .then(({ data }) => {
                    this.setMaterialData(data);
                    this.isLoading = false;
                })
                .catch(this.displayError);
        },

        resetHelpLoading() {
            this.error = null;
            this.isLoading = true;
        },

        displayError(error) {
            this.error = error;
            this.isLoading = false;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                this.errors = { ...details };
            }
        },

        setMaterialData(data) {
            this.material = data;
            this.$store.commit('setPageSubTitle', this.material.name);
        },
    },
};
