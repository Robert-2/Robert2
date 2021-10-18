import './index.scss';
import { toRefs } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';

import type { Render, SetupContext } from '@vue/composition-api';
import type { ListTemplate } from '@/stores/api/list-templates';

type Props = {
    data: ListTemplate[],
    onSelect(id: number): void,
};

// @vue/component
const ListTemplateUsageList = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();
    const { data } = toRefs(props);

    return () => {
        if (data.value.length === 0) {
            return (
                <div class="ListTemplateUsageList ListTemplateUsageList--empty">
                    <p class="ListTemplateUsageList__nothing">
                        {__('no-list-template-available')}
                    </p>
                    <router-link to="/list-templates/new">
                        {__('create-list-template')}
                    </router-link>
                </div>
            );
        }

        return (
            <table class="ListTemplateUsageList">
                <thead>
                    <tr>
                        <th class="ListTemplateUsageList__heading">Nom</th>
                        <th class="ListTemplateUsageList__heading">Description</th>
                        <th class="ListTemplateUsageList__heading ListTemplateUsageList__heading--actions" />
                    </tr>
                </thead>
                <tbody>
                    {data.value.map((listTemplate: ListTemplate) => (
                        <tr class="ListTemplateUsageList__item" key={listTemplate.id}>
                            <td class="ListTemplateUsageList__item__cell">{listTemplate.name}</td>
                            <td class="ListTemplateUsageList__item__cell">{listTemplate.description}</td>
                            <td class="ListTemplateUsageList__item__cell">
                                <button
                                    type="button"
                                    class="info"
                                    onClick={() => { emit('select', listTemplate.id); }}
                                >
                                    {__('use')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
};

ListTemplateUsageList.props = {
    data: { type: Array, required: true },
};

ListTemplateUsageList.emits = ['select'];

export default ListTemplateUsageList;
