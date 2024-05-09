import './index.scss';
import DateTime from '@/utils/datetime';
import upperFirst from 'lodash/upperFirst';
import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';

type Props = {
    /** La date à afficher en temps relatif. */
    date: DateTime,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    now: DateTime,
};

/** Affiche une date de manière relative. */
const RelativeTime = defineComponent({
    name: 'RelativeTime',
    props: {
        date: {
            type: DateTime as PropType<Props['date']>,
            required: true,
        },
    },
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data: (): Data => ({
        now: DateTime.now(),
    }),
    computed: {
        formattedTime(): string {
            return this.date.toReadable();
        },

        relativeTime(): string {
            return this.date.from(this.now);
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = DateTime.now(); }, 60_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    render() {
        const { formattedTime, relativeTime } = this;

        return (
            <span class="RelativeTime" v-tooltip={formattedTime}>
                {upperFirst(relativeTime)}
            </span>
        );
    },
});

export default RelativeTime;
