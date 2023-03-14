import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { Group } from '@/stores/api/groups';
import Item from './Item';

// @vue/component
const DefaultLayoutSidebarMenu = defineComponent({
    name: 'DefaultLayoutSidebarMenu',
    computed: {
        links() {
            const links = [
                { ident: 'calendar', url: '/', icon: 'calendar-alt', exact: true },
            ];

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
                {links.map(({ ident, icon, url, counter, exact }) => (
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
