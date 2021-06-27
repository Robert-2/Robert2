import './index.scss';

const Page = {
  name: 'Page',
  props: {
    name: { type: String, required: true },
    title: String,
    render: Function,
  },
  watch: {
    title(newTitle) {
      this.$store.commit('setPageRawTitle', newTitle ?? null);
    },
  },
  mounted() {
    this.$store.commit('setPageRawTitle', this.title ?? null);
  },
  beforeDestroy() {
    this.$store.commit('setPageRawTitle', null);
  },
  render() {
    const content = this.$props.render
      ? this.$props.render()
      : this.$slots.default;

    return (
      <div class="content">
        <div class="content__main-view">
          <div class={['Page', `Page--${this.name}`]}>
            {content}
          </div>
        </div>
      </div>
    );
  },
};

export default Page;
