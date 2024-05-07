import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { BookingsViewMode } from '@/stores/api/users';
import { Group } from '@/stores/api/groups';
import Item from './Item';

type MenuLink = {
    ident: string,
    icon: string,
    url: string,
    exact?: boolean,
    counter?: number,
};

/** Menu latéral pour le layout par défaut de l'application. */
const DefaultLayoutSidebarMenu = defineComponent({
    name: 'DefaultLayoutSidebarMenu',
    computed: {
        pendingCount(): number {
            return this.$store.getters['requestsStats/pendingCount'];
        },

        links(): MenuLink[] {
            const links: MenuLink[] = [];

            const { default_bookings_view: defaultBookingsView } = this.$store.state.auth.user;
            if (defaultBookingsView === BookingsViewMode.LISTING) {
                links.push({ ident: 'schedule-listing', url: '/schedule/listing', icon: 'list' });
            } else {
                links.push({ ident: 'schedule-calendar', url: '/schedule/calendar', icon: 'calendar-alt' });
            }

            const isAdmin = this.$store.getters['auth/is'](Group.ADMIN);
            const isMember = this.$store.getters['auth/is'](Group.MEMBER);
            if (isAdmin || isMember) {
                links.push(
                    { ident: 'materials', url: '/materials', icon: 'box' },
                    { ident: 'technicians', url: '/technicians', icon: 'people-carry' },
                    { ident: 'beneficiaries', url: '/beneficiaries', icon: 'address-book' },
                );
            }

            if (isAdmin) {
                links.push(
                    { ident: 'categories', url: '/categories', icon: 'sitemap' },
                    { ident: 'tags', url: '/tags', icon: 'tags' },
                    { ident: 'parks', url: '/parks', icon: 'industry' },
                    { ident: 'users', url: '/users', icon: 'users-cog' },
                    { ident: 'settings', url: '/settings', icon: 'sliders-h' },
                );
            }

            return links;
        },
    },
    render() {
        const { links } = this;

        return (
            <ul class="DefaultLayoutSidebarMenu">
                {links.map(({ ident, icon, url, counter, exact }: MenuLink) => (
                    <Item
                        key={ident}
                        ident={ident}
                        url={url}
                        icon={icon}
                        counter={counter}
                        exact={exact}
                    />
                ))}
            </ul>
        );
    },
});

export default DefaultLayoutSidebarMenu;
