import './index.scss';
import { defineComponent } from '@vue/composition-api';
import config from '@/globals/config';
import { Group } from '@/stores/api/groups';
import Header from './Header';
import MainMenu from './MainMenu';
import UserMenu from './UserMenu';

import type { PropType } from '@vue/composition-api';

type Props = {
    /** Est-ce que la sidebar est ouverte ? */
    isOpen: boolean,
};

/** Barre latérale du layout par défaut de l'application. */
const DefaultLayoutSidebar = defineComponent({
    name: 'DefaultLayoutSidebar',
    props: {
        isOpen: {
            type: Boolean as PropType<Required<Props>['isOpen']>,
            required: true,
        },
    },
    computed: {
        canUseQuickScan() {
            return (
                this.$store.getters['auth/is'](Group.ADMINISTRATION) ||
                this.$store.getters['auth/is'](Group.MANAGEMENT)
            );
        },

        year(): number {
            return (new Date()).getFullYear();
        },

        version(): string {
            return config.version;
        },
    },
    render() {
        const {
            year,
            version,
            isOpen,
        } = this;

        const classNames = ['DefaultLayoutSidebar', {
            'DefaultLayoutSidebar--opened': isOpen,
        }];

        return (
            <div class={classNames}>
                <Header />
                <MainMenu class="DefaultLayoutSidebar__main-menu" />
                <UserMenu class="DefaultLayoutSidebar__user-menu" />
                <footer class="DefaultLayoutSidebar__footer">
                    <span class="DefaultLayoutSidebar__copyright">© 2017-{year}</span>
                    <span class="DefaultLayoutSidebar__version">v.{version}</span>
                </footer>
            </div>
        );
    },
});

export default DefaultLayoutSidebar;
