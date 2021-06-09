import './index.scss';
import Logo from '@/components/Logo/Logo.vue';
import TopMenu from './TopMenu';

export default {
  name: 'MainHeader',
  computed: {
    pageTitle() {
      return this.$store.state.pageTitle;
    },

    pageSubTitle() {
      return this.$store.state.pageSubTitle;
    },
  },
  watch: {
    pageTitle() {
      this.$emit('toggleMenu', false);
    },
  },
  methods: {
    toggleMenu() {
      this.$emit('toggleMenu', 'toggle');
    },
  },
  render() {
    const {
      $t: __,
      pageTitle,
      pageSubTitle,
      toggleMenu,
    } = this;

    return (
      <div class="MainHeader">
        <div class="MainHeader__logo">
          <Logo minimalist />
        </div>
        <div class="MainHeader__menu-toggle" onClick={toggleMenu}>
          <i class="fas fa-bars fa-2x"></i>
        </div>
        <div class="MainHeader__title">
          {__(pageTitle, { pageSubTitle })}
        </div>
        <TopMenu class="MainHeader__menu" />
      </div>
    );
  },
};
