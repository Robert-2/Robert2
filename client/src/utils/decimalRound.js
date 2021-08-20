export const round = (value, depth = 2) => (
    Math.round((value + Number.EPSILON) * 10 ** depth) / 10 ** depth
);

export const floor = (value, depth = 2) => (
    Math.floor((value + Number.EPSILON) * 10 ** depth) / 10 ** depth
);
