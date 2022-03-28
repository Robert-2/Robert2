import './index.scss';

// @vue/component
export default {
    name: 'DefaultLayoutSidebarMenu',
    computed: {
        links() {
            const isAdmin = this.$store.getters['auth/is']('admin');
            const isMember = this.$store.getters['auth/is']('member');

            const links = [
                { url: '/', icon: 'calendar-alt', label: 'page-calendar.title', exact: true },
            ];

            if (isAdmin || isMember) {
                links.push(
                    { url: '/materials', icon: 'box', label: 'page-materials.title' },
                    { url: '/technicians', icon: 'people-carry', label: 'page-technicians.title' },
                    { url: '/beneficiaries', icon: 'address-book', label: 'page-beneficiaries.title' },
                );
            }

            if (isAdmin) {
                links.push(
                    { url: '/categories', icon: 'sitemap', label: 'page-categories.title' },
                    { url: '/tags', icon: 'tags', label: 'page-tags.title' },
                    { url: '/parks', icon: 'industry', label: 'page-parks.title' },
                    { url: '/users', icon: 'users-cog', label: 'page-users.title' },
                    { url: '/settings', icon: 'sliders-h', label: 'settings' },
                );
            }

            return links;
        },
    },
    render() {
        const { $t: __, links } = this;

        return (
            <ul class="DefaultLayoutSidebarMenu">
                {links.map(({ icon, label, url, exact = false }, index) => (
                    <router-link key={index} to={url} exact={exact} custom>
                        {({ href, navigate, isActive }) => (
                            <li class={['DefaultLayoutSidebarMenu__item', { 'DefaultLayoutSidebarMenu__item--active': isActive }]}>
                                <a href={href} onClick={navigate} class="DefaultLayoutSidebarMenu__item__link">
                                    <i class={['DefaultLayoutSidebarMenu__item__icon', 'fas', `fa-${icon}`]} /><br />
                                    <span class="DefaultLayoutSidebarMenu__item__title">{__(label)}</span>
                                </a>
                            </li>
                        )}
                    </router-link>
                ))}
            </ul>
        );
    },
};
