import 'vue-router';

declare module 'vue-router' {
    export type CustomRouterLinkProps = {
        href: string,
        navigate(): void,
        isActive: boolean,
    };

    export type RouteQuery = Record<string, string | Array<string | null> | Record<string, any>>;

    export interface Route {
        query: RouteQuery;
    }
}
