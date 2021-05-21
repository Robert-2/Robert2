const LAYOUT_MAP = {
  qwerty: {
    48: { base: '0' },
    49: { base: '1' },
    50: { base: '2' },
    51: { base: '3', shift: '#' },
    52: { base: '4', shift: '$' },
    53: { base: '5' },
    54: { base: '6', shift: '^' },
    55: { base: '7' },
    56: { base: '8' },
    57: { base: '9' },
    191: { base: '/' },
    219: { base: '[' },
    220: { shift: '|' },
    221: { base: ']' },
    223: { base: '/' },
  },
  azerty: {
    48: { shift: '0' },
    49: { shift: '1' },
    50: { shift: '2' },
    51: { alt: '#', shift: '3' },
    52: { shift: '4' },
    53: { shift: '5', alt: '[' },
    54: { shift: '6', alt: '|' },
    55: { shift: '7' },
    56: { shift: '8' },
    57: { shift: '9', alt: '^' },
    191: { shift: '/' },
    221: { base: '$', alt: ']' },
  },
};

const decodeKeyEvent = (event, inputLayout) => {
  const keyCode = (event.which || event.keyCode).toString();
  const decoded = String.fromCharCode(keyCode);

  // - Cas particuliers
  if (inputLayout === 'qwerty' && !event.altKey && !event.shiftKey) {
    // - Left bracket ?
    if (['219', '221'].includes(keyCode) && event.code === 'BracketLeft') {
      return '[';
    }

    // - Right bracket ?
    if (keyCode === '186' && event.code === 'BracketRight') {
      return ']';
    }

    // - Slash ?
    if (keyCode === '223' && event.code === 'Slash') {
      return '/';
    }
  }

  // - Cas basiques
  if (!event.altKey) {
    const isBasicLetter = keyCode >= 65 && keyCode <= 90;
    if (isBasicLetter) {
      return event.shiftKey
        ? decoded.toUpperCase()
        : decoded.toLowerCase();
    }

    // - Pavé numérique
    const isKeypadNumeric = keyCode >= 96 && keyCode <= 105;
    if (isKeypadNumeric) {
      return (keyCode - 96).toString();
    }
  }

  let format = 'base';
  if (event.shiftKey || event.altKey) {
    format = event.shiftKey ? 'shift' : 'alt';
  }

  const keyData = LAYOUT_MAP[inputLayout][keyCode];
  if (!keyData || !(format in keyData) || event.key === 'Dead') {
    if (['/', '|', '^', '#', '$', '[', ']'].includes(event.key)) {
      return event.key;
    }
    return '';
  }

  return keyData[format] ?? '';
};

export default decodeKeyEvent;
