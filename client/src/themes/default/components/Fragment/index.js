import './index.scss';

// @vue/component
export default {
    name: 'Fragment',
    render() {
        const children = this.$slots.default;

        return (
            <div class="Fragment">
                {children}
            </div>
        );
    },
};
