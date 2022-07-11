import './index.scss';

// @vue/component
export default {
    name: 'TagsList',
    props: {
        tags: { type: Array, required: true },
    },
    render() {
        const { tags } = this;

        return (
            <ul class="TagsList">
                {tags.map(({ id, name }) => (
                    <li key={id} class="TagsList__item">
                        <i class="fas fa-tag" /> {name}
                    </li>
                ))}
            </ul>
        );
    },
};
