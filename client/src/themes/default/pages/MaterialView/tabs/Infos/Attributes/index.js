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
    render() {
        const { $t: __, attributes, formatDate } = this;

        if (attributes.length === 0) {
            return null;
        }

        return (
            <div class="MaterialViewInfosAttributes">
                <h3>{__('special-attributes')}</h3>
                {attributes.map(({ id, name, type, value, unit }) => (
                    <dl key={id} class="MaterialViewInfosAttributes__attribute">
                        <dt class="MaterialViewInfosAttributes__attribute__name">
                            {name}
                        </dt>
                        <dd class="MaterialViewInfosAttributes__attribute__value">
                            {!['boolean', 'date'].includes(type) && [value, unit].join('\u00A0')}
                            {type === 'date' && formatDate(value)}
                            {type === 'boolean' && (value ? __('yes') : __('no'))}
                        </dd>
                    </dl>
                ))}
            </div>
        );
    },
};
