import Vue from 'vue';

//
// - Types
//

export type Group = {
    id: 'admin' | 'member' | 'visitor',
    name: string,
};

//
// - Fonctions
//

const all = (): Group[] => {
    const { translate: __ } = (Vue as any).i18n;

    return [
        { id: 'admin', name: __('admin') },
        { id: 'member', name: __('member') },
        { id: 'visitor', name: __('visitor') },
    ];
};

export default { all };
