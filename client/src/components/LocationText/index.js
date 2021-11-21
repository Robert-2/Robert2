import './index.scss';
import { defineComponent } from '@vue/composition-api';

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
                <i class="fas fa-map-marker-alt" />
                {` ${__('in')} `}
                <strong>{location}</strong>
                {' '}
                <a
                    rel="noopener noreferrer nofollow"
                    href={`https://maps.google.com/?q=${location}`}
                    title={__('open-in-google-maps')}
                    target="_blank"
                >
                    <i class="fas fa-external-link-alt" />
                </a>
            </div>
        );
    },
});
