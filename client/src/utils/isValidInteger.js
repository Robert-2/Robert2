const isValidInteger = (value) => {
  if (typeof value === 'number') {
    return !Number.isNaN(value) && Number.isInteger(parseFloat(value));
  }
  return /^-?[0-9]+$/.test(value);
};

export default isValidInteger;
