import Vue from 'vue';

//
// - Enums
//

export enum Group {
    /** Représente le groupe des administrateurs. */
    ADMIN = 'admin',

    /** Représente le groupe des membres de l'équipe. */
    MEMBER = 'member',

    /** Représente le groupe des visiteurs. */
    VISITOR = 'visitor',
}

//
// - Types
//

export type GroupDetails = {
    id: Group,
    name: string,
};

//
// - Fonctions
//

const all = (): GroupDetails[] => {
    const { translate: __ } = (Vue as any).i18n;

    return [
        { id: Group.ADMIN, name: __('admin') },
        { id: Group.MEMBER, name: __('member') },
        { id: Group.VISITOR, name: __('visitor') },
    ];
};

const one = (group: Group): GroupDetails | undefined => {
    const allGroups = all();
    return allGroups.find(({ id }: GroupDetails) => id === group);
};

export default { all, one };
