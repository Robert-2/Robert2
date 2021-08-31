import './index.scss';

// @vue/component
export default {
    name: 'MaterialTags',
    props: {
        tags: { type: Array, required: true },
    },
    render() {
        const { tags } = this;

        return (
            <ul class="MaterialTags">
                {tags.map(({ id, name }) => (
                    <li key={id} class="MaterialTags__item">
                        <i class="fas fa-tag" /> {name}
                    </li>
                ))}
            </ul>
        );
    },
};
