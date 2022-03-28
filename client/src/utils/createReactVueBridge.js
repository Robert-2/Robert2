import React from 'react';
import { render as reactRender } from 'react-dom';
import { ref, watchEffect } from '@vue/composition-api';

const createVueBridge = (reactComponent, propsList) => ({
    name: `react-bridge--${reactComponent.name?.toLowerCase() ?? 'unknown'}`,
    props: propsList,
    setup(props) {
        const moutingPoint = ref(null);

        watchEffect(
            () => {
                const node = moutingPoint.value;
                if (!node) {
                    return;
                }

                const element = React.createElement(reactComponent, props);
                reactRender(element, node);
            },
            { flush: 'post' },
        );

        return () => <div ref={moutingPoint} />;
    },
});

export default createVueBridge;
