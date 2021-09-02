import './index.scss';

// @vue/component
export default {
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
                    href={`https://www.openstreetmap.org/search?query=${location}`}
                    title={__('open-in-openstreetmap')}
                    target="_blank"
                >
                    <i class="fas fa-external-link-alt" />
                </a>
            </div>
        );
    },
};
