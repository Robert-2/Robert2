import './index.scss';

// @vue/component
export default {
    name: 'DefaultLayoutSidebarMenu',
    computed: {
        links() {
            const isAdmin = this.$store.getters['auth/is']('admin');
            const isMember = this.$store.getters['auth/is']('member');

            const links = [
                { ident: 'calendar', url: '/', icon: 'calendar-alt', exact: true },
            ];

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
        const { $t: __, links } = this;

        return (
            <ul class="DefaultLayoutSidebarMenu">
                {links.map(({ ident, icon, url, exact = false }) => (
                    <router-link key={ident} to={url} exact={exact} custom>
                        {({ href, navigate, isActive }) => (
                            <li class={['DefaultLayoutSidebarMenu__item', { 'DefaultLayoutSidebarMenu__item--active': isActive }]}>
                                <a href={href} onClick={navigate} class="DefaultLayoutSidebarMenu__item__link">
                                    <i class={['DefaultLayoutSidebarMenu__item__icon', 'fas', `fa-${icon}`]} /><br />
                                    <span class="DefaultLayoutSidebarMenu__item__title">
                                        {__(`layout.default.menu.${ident}`)}
                                    </span>
                                </a>
                            </li>
                        )}
                    </router-link>
                ))}
            </ul>
        );
    },
};
