const hasIncludes = (needle, searches) => searches.some(
  (search) => needle.includes(search),
);

export default hasIncludes;
