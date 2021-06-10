import './index.scss';
import ClickOutside from 'vue-click-outside';

export const getItemClassnames = (isActive) => ({
  Dropdown__item: true,
  'Dropdown__item--active': isActive,
});

export default {
  name: 'Dropdown',
  directives: { ClickOutside },
  data() {
    return {
      isOpen: false,
    };
  },
  watch: {
    $route() {
      this.closeDropdown();
    },
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },

    closeDropdown() {
      this.isOpen = false;
    },
  },
  render() {
    const { isOpen, toggleDropdown, closeDropdown } = this;
    const { buttonText, title, items } = this.$slots;

    return (
      <div class={{ Dropdown: true, 'Dropdown--open': isOpen }} vClickOutside={closeDropdown}>
        <div class="Dropdown__button" onClick={toggleDropdown}>
          <span class="Dropdown__button__text">
            {buttonText || <i class="Dropdown__button__icon fas fa-ellipsis-h" />}
          </span>
          {buttonText && (
            <i class={`Dropdown__button__chevron fas fa-chevron-${isOpen ? 'up' : 'down'}`} />
          )}
        </div>
        <div class="Dropdown__menu">
          {title && <h3 class="Dropdown__menu__title">{title}</h3>}
          <ul class="Dropdown__menu__items">
            {items}
          </ul>
        </div>
      </div>
    );
  },
};
