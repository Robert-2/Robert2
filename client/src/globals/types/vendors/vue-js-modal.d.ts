import 'vue-js-modal';

declare module 'vue-js-modal' {
    export type OnCloseEvent<Params extends AnyLiteralObject> = {
        /** Le nom de la modale (créé dynamiquement par vue-js-modal). */
        name: string,

        /** La ref contenant l'élément HTML rendu de la modale. */
        ref: HTMLDivElement,

        /** L'état dans lequel se trouve la modale au moment de cet événement. */
        state: 'before-close',

        /** Une fonction permettant d'annuler la fermeture de la modale. */
        cancel(): void,

        /** Données passées en second paramètre de `$emit('close', params) dans la modale. */
        params: Params | undefined,
    };
}
