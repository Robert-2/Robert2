import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';

// @vue/component
export default defineComponent({
    name: 'LocationText',
    props: {
        location: { type: String, required: true },
    },
    render() {
        const { $t: __, location } = this;

        return (
            <div class="LocationText">
                <Icon name="map-marker-alt" class="LocationText__icon" />
                <span>
                    <strong>{__('in', { location })}</strong>
                    {' '}
                    <a
                        rel="noopener noreferrer nofollow"
                        href={`https://maps.google.com/?q=${location}`}
                        title={__('open-in-google-maps')}
                        target="_blank"
                    >
                        <Icon name="external-link-alt" />
                    </a>
                </span>
            </div>
        );
    },
});
