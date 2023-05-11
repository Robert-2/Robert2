const LAYOUT_MAP = {
    'qwerty': {
        Digit0: { base: '0' },
        Digit1: { base: '1' },
        Digit2: { base: '2' },
        Digit3: { base: '3', shift: '#' },
        Digit4: { base: '4', shift: '$' },
        Digit5: { base: '5' },
        Digit6: { base: '6', shift: '^' },
        Digit7: { base: '7' },
        Digit8: { base: '8' },
        Digit9: { base: '9' },
        Slash: { base: '/' },
        Backslash: { shift: '|' },
        BracketLeft: { base: '[' },
        BracketRight: { base: ']' },
    },
};

const decodeKeyEvent = (event, inputLayout) => {
    const keyCode = (event.which || event.keyCode).toString();

    // eslint-disable-next-line unicorn/prefer-code-point
    const decoded = String.fromCharCode(keyCode);

    // - Cas particuliers
    if (event.key === 'Dead' && inputLayout === 'azerty') {
        return '';
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

    const keyData = LAYOUT_MAP[inputLayout]?.[event.code] ?? LAYOUT_MAP[inputLayout]?.[keyCode];
    if (!keyData || !(format in keyData)) {
        const ACCEPTED_CHARS = [
            '/', '|', '^', '#', '$', '[', ']', '0', '1',
            '2', '3', '4', '5', '6', '7', '8', '9',
        ];
        if (ACCEPTED_CHARS.includes(event.key)) {
            return event.key;
        }
        return '';
    }

    return keyData[format] ?? '';
};

export default decodeKeyEvent;
