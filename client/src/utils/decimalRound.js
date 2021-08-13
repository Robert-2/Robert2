const decimalRound = (value, depth = 2) => (
    Math.round((value + Number.EPSILON) * 10 ** depth) / 10 ** depth
);

export default decimalRound;
