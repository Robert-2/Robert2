import { isDayjs } from 'dayjs';
import invariant from 'invariant';

import type dayjs from 'dayjs';
import type { Dayjs, DayjsInput, PluginFunc } from 'dayjs';

const explicitPlugin: PluginFunc = (_: unknown, DayjsClass: typeof Dayjs, dayjsFactory: typeof dayjs) => {
    dayjsFactory.now = (): Dayjs => (
        dayjsFactory()
    );

    dayjsFactory.from = (input: DayjsInput): Dayjs => (
        !isDayjs(input)
            // @ts-expect-error -- Type core de `Dayjs` invalide.
            ? new DayjsClass({ date: input, args: [input] })
            : input.clone()
    );

    dayjsFactory.fromFormat = (input: string, format: string): Dayjs => {
        invariant(typeof input === 'string', `The input should be a string.`);
        invariant(typeof format === 'string', `The input format should be a string.`);

        // @ts-expect-error -- Type core de `Dayjs` invalide.
        return new DayjsClass({ date: input, args: [input, format, true] });
    };
};

export default explicitPlugin;
