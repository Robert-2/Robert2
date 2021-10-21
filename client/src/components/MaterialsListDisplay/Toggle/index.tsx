import './index.scss';
import { toRefs } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';

import type { Render, SetupContext } from '@vue/composition-api';

type Props = {
    displayed: boolean,
    onToggle(): void,
};

// @vue/component
const MaterialListDisplayToggle = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();
    const { displayed } = toRefs(props);

    const handleToggle = (): void => {
        emit('toggle');
    };

    return () => (
        <div class="MaterialListDisplayToggle">
            <button type="button" onClick={handleToggle} class={{ info: !displayed.value }}>
                <i class={{ 'fas': true, 'fa-eye': !displayed.value, 'fa-eye-slash': displayed.value }} />
                <span class="MaterialListDisplayToggle__text">
                    {__(displayed.value ? 'hide-materials-details' : 'show-materials-details')}
                </span>
            </button>
        </div>
    );
};

MaterialListDisplayToggle.props = {
    displayed: { type: Boolean },
};

MaterialListDisplayToggle.emits = ['toggle'];

export default MaterialListDisplayToggle;
