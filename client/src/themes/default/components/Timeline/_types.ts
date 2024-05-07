import type DateTime from '@/utils/datetime';
import type Period from '@/utils/period';
import type Color from '@/utils/color';
import type { Merge } from 'type-fest';
import type { ClassValue } from 'clsx';
import type { RawColor } from '@/utils/color';
import type { TimeUnit } from '@/utils/datetime';
import type {
    TimelineGroup as TimelineGroupCore,
    TimelineItem as TimelineItemCore,
    TimelineClickEvent as TimelineClickEventCore,
} from '@loxya/vis-timeline';

export enum TimelineItemPeriodType {
    /**
     * Correspond à la période attendue pour un élément de la timeline.
     *
     * - Cette période commence forcément après ou au moment de la période effective.
     * - Cette période est toujours considérée comme "secondaire" par rapport à la période effective:
     *   Si la période effective se termine avant, cette période sera tronquée sur la timeline.
     */
    EXPECTED = 'expected',

    /**
     * Correspond à la période effective pour un élément de la timeline.
     *
     * - Cette période commence forcément avant ou au moment de la période attendue.
     * - Cette période se termine forcément après le début de la période attendue.
     * - Cette période peut se terminer avant ou après la date de fin de période attendue.
     */
    ACTUAL = 'actual',
}

export type TimelineItemPeriods = Record<TimelineItemPeriodType, Period>;

export type TimelineItem = (
    & Omit<TimelineItemCore, 'content' | 'title' | 'className' | 'style' | 'start' | 'end'>
    & {
        summary: string,
        tooltip?: string,
        period: Period | TimelineItemPeriods,
        color?: Color | RawColor | null,
        className?: ClassValue,
        style?: AnyLiteralObject,
    }
);

export type TimelineGroup = (
    & Omit<TimelineGroupCore, 'content' | 'title' | 'className' | 'style'>
    & {
        name: string,
        className?: ClassValue,
        style?: AnyLiteralObject,
    }
);

export type SnapTime = {
    precision: number,
    unit: TimeUnit,
};

export type TimelineItemIdentifier<T extends TimelineItem['id'] = TimelineItem['id']> = {
    id: T,
    type: TimelineItemPeriodType | undefined,
};

export type TimelineClickEvent = Merge<
    Pick<TimelineClickEventCore, 'x' | 'y' | 'pageX' | 'pageY'>,
    {
        item: TimelineItemIdentifier | null,
        group: TimelineGroup['id'] | null,
        snappedTime: DateTime,
        time: DateTime,
    }
>;

export type TimelineDataChangeEvent = {
    type: 'add' | 'update' | 'remove',
    items: Array<TimelineItem['id']>,
};

export type TimelineConfirmCallback = (confirm: boolean) => void;
