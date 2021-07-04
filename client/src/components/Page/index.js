import './index.scss';
import { APP_NAME } from '@/config/constants';

const Page = {
  name: 'Page',
  props: {
    name: { type: String, required: true },
    title: String,
    actions: Array,
    render: Function,
  },
  watch: {
    title(newTitle) {
      this.updateTitle(newTitle);
    },
  },
  mounted() {
    this.updateTitle(this.title);
  },
  beforeDestroy() {
    this.$store.commit('setPageRawTitle', null);
  },
  methods: {
    updateTitle(newTitle) {
      this.$store.commit('setPageRawTitle', newTitle ?? null);
      document.title = [newTitle, APP_NAME].filter(Boolean).join(' - ');
    },
  },
  render() {
    const { actions, render } = this.$props;
    const content = render ? render() : this.$slots.default;

    return (
      <div class="content">
        {actions && actions.length > 0 && (
          <div class="content__header header-page">
            <div class="header-page__help"></div>
            <nav class="header-page__actions">
              {actions}
            </nav>
          </div>
        )}
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
