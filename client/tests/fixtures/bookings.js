import { dataFactory } from './@utils';
import events from './events';

const data = (type) => [
    events.booking[type](1),
    events.booking[type](2),
    events.booking[type](3),
    events.booking[type](4),
    events.booking[type](5),
    events.booking[type](6),
    events.booking[type](7),
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asExcerpt = dataFactory(data('excerpt'));

/** @type {import('./@utils').FactoryReturnType} */
const asSummary = dataFactory(data('summary'));

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data('default'));

export default {
    excerpt: asExcerpt,
    summary: asSummary,
    default: asDefault,
};
