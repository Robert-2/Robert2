const isValidInteger = (value) => (
  !Number.isNaN(value) && Number.isInteger(parseFloat(value))
);

export default isValidInteger;
