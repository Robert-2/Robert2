import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

type Data = {
    isSidebarOpened: boolean,
};

/** Variante par défaut du layout de l'application. */
const DefaultLayout = defineComponent({
    name: 'DefaultLayout',
    data: (): Data => ({
        isSidebarOpened: false,
    }),
    computed: {
        isLogged(): boolean {
            return this.$store.getters['auth/isLogged'];
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSidebarToggle(isOpen: boolean | 'toggle') {
            if (isOpen === 'toggle') {
                this.isSidebarOpened = !this.isSidebarOpened;
                return;
            }
            this.isSidebarOpened = isOpen;
        },
    },
    render() {
        const children = this.$slots.default;
        const {
            isLogged,
            isSidebarOpened,
            handleSidebarToggle,
        } = this;

        return (
            <div class="DefaultLayout">
                {isLogged && (
                    <Sidebar
                        isOpen={isSidebarOpened}
                    />
                )}
                <div class="DefaultLayout__body">
                    {isLogged && <Header onToggleMenu={handleSidebarToggle} />}
                    <div class="DefaultLayout__body__content">
                        {children}
                    </div>
                </div>
            </div>
        );
    },
});

export default DefaultLayout;
