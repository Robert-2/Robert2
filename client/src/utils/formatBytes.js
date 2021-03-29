const formatBytes = (sizeInBytes) => {
  if (sizeInBytes === 0) {
    return '0 Bytes';
  }

  const kilo = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const rangeIndex = Math.floor(Math.log(sizeInBytes) / Math.log(kilo));
  const size = parseFloat((sizeInBytes / (kilo ** rangeIndex)).toFixed(1));

  return `${size} ${sizes[rangeIndex]}`;
};

export default formatBytes;
