//
// - SCSS
//

declare module '*.scss';

//
// - SVG
//

// @see https://www.npmjs.com/package/vue-cli-plugin-svg
declare module '*.svg?inline' {
    // TODO: Typer ça comme un component Vue qui accepte les props d'un élément SVG (SVGSVGElement).
    const component: any;
    export default component;
}

declare module '*.svg' {
    const src: string;
    export default src;
}

//
// - Images
//

declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.bmp' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}
