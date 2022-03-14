import './index.scss';
import { ref, computed } from '@vue/composition-api';
import Header from './Header';
import Sidebar from './Sidebar';

// @vue/component
const DefaultLayout = (_, { root, slots }) => {
    const isLogged = computed(() => root.$store.getters['auth/isLogged']);
    const isOpenedSidebar = ref(false);

    const handleToggleSidebar = (isOpen) => {
        if (isOpen === 'toggle') {
            isOpenedSidebar.value = !isOpenedSidebar.value;
            return;
        }
        isOpenedSidebar.value = isOpen;
    };

    return () => {
        const children = slots.default?.();

        return (
            <div class="DefaultLayout">
                {isLogged.value && <Header onToggleMenu={handleToggleSidebar} />}
                <div class="DefaultLayout__body">
                    {isLogged.value && <Sidebar isOpen={isOpenedSidebar.value} />}
                    {children}
                </div>
            </div>
        );
    };
};

export default DefaultLayout;
