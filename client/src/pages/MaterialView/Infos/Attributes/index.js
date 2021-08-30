import './index.scss';
import moment from 'moment';

// @vue/component
export default {
    name: 'MaterialViewInfosAttributes',
    props: {
        attributes: { required: true, type: Array },
    },
    methods: {
        formatDate(value) {
            return moment(value).format('DD/MM/yyyy');
        },
    },
};
