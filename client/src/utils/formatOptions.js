const formatOptions = (data, labelFields = ['name'], emptyLabel = null) => {
  if (!data || data.length === 0) {
    return [
      { value: '', label: 'N/A' },
    ];
  }

  const options = data.map(
    (item) => {
      const labelParts = labelFields.map((field) => {
        if (field.match(/\.+/)) {
          let itemField = item;
          field.split('.').forEach((fieldPart) => {
            if (itemField && Object.keys(itemField).includes(fieldPart)) {
              itemField = itemField[fieldPart];
            } else {
              itemField = null;
            }
          });
          return itemField;
        }

        if (Object.keys(item).includes(field)) {
          return item[field];
        }

        return field;
      });

      const label = labelParts.filter((_label) => !!_label).join(' ');
      return { value: item.id, label };
    },
  );

  if (emptyLabel) {
    options.unshift({ value: '', label: emptyLabel });
  }

  return options;
};

export default formatOptions;
