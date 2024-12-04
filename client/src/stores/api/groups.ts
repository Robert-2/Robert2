import Vue from 'vue';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

export enum Group {
    /** Représente le groupe des administrateurs. */
    ADMINISTRATION = 'administration',

    /** Représente le groupe des gestionnaires, membres de l'équipe. */
    MANAGEMENT = 'management',

    /**
     * Représente le groupe des utilisateurs ayant accès au
     * planning général, en lecture seule.
     */
    READONLY_PLANNING_GENERAL = 'readonly-planning-general',

    /**
     * Représente le groupe des utilisateurs ayant uniquement accès
     * à leur propre planning, en lecture seule.
     */
    READONLY_PLANNING_SELF = 'readonly-planning-self',
}

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type GroupDetails = {
    id: Group,
    name: string,
};

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const all = (): GroupDetails[] => {
    const { translate: __ } = (Vue as any).i18n;

    return [
        { id: Group.ADMINISTRATION, name: __('groups.administration') },
        { id: Group.MANAGEMENT, name: __('groups.management') },
        { id: Group.READONLY_PLANNING_GENERAL, name: __('groups.readonly-planning-general') },
        { id: Group.READONLY_PLANNING_SELF, name: __('groups.readonly-planning-self') },
    ];
};

export default { all };
