import 'vue-router';

declare module 'vue-router' {
    export type CustomRouterLinkProps = {
        href: string,
        navigate(): void,
        isActive: boolean,
    };
}
