import Config from '@/config/globalConfig';
import decodeKeyEvent from '@/utils/decodeKeyEvent';

const PREFIX_KEYCODES = Object.freeze([]);
const SUFFIX_KEYCODES = Object.freeze([9, 13]); // Tab, Enter.

const SCAN_DELAY = 80; // - Millisecondes.

const BARCODE_PREFIX = '^#[';
const BARCODE_SUFFIX = ']#$';

const revertScanState = (target, input) => {
  switch (target.nodeName) {
    case 'INPUT':
    case 'TEXTAREA':
      // eslint-disable-next-line no-param-reassign
      target.value += input;
      break;

    case 'BODY':
      break;

    default:
      console.log('Unhandled target in revert scan state:', target.nodeName, target);
  }
};

const observeBarcodeScan = (handler) => {
  let input = '';

  let timeoutID;
  let isPostScanTime = false;
  const processor = (e) => {
    const isScanInProgress = !!timeoutID;

    if (timeoutID) {
      clearTimeout(timeoutID);
      timeoutID = null;
    }

    const abortScan = (redispatch, reason) => {
      console.debug(`Traitement du scan interrompu: ${reason}`);

      if (redispatch) {
        revertScanState(e.target, input);
      }

      timeoutID = null;
      input = '';
    };

    let isScanFinished = false;
    const keyCode = e.which || e.keyCode;
    switch (true) {
      // - Si on est en période pre ou post-scan et que l'on rencontre
      //   un caractère de début ou de fin de scan (= tab / entrée), on l'ignore.
      case isPostScanTime && SUFFIX_KEYCODES.includes(keyCode):
      case !isScanInProgress && PREFIX_KEYCODES.includes(keyCode):
        // - On annule le post scan time quoi qu'il en soit.
        isPostScanTime = false;

        e.preventDefault();
        e.stopImmediatePropagation();
        return;

      // - Sinon, on ajoute le caractère à la chaîne.
      default: {
        const char = decodeKeyEvent(e, Config.handScanner.inputLayout);
        if (char === null || char === '') {
          return;
        }

        // - Si on a pas encore d'input et que le code ne correspond pas, on retourne directement.
        //   (ce qui permet d'éviter de `preventDefault` avec les problèmes que ça implique)
        if (!input.length && BARCODE_PREFIX.charAt(0) !== char) {
          return;
        }

        // - On annule le post scan time si on a rencontré ne serais-ce
        //   qu'un début d'indicateur de début.
        isPostScanTime = false;

        e.preventDefault();
        e.stopImmediatePropagation();

        input += char;

        // - S'il manque le prefixe spécifique aux scans, on arrête là.
        if (input.length <= BARCODE_PREFIX.length) {
          const isPrefixMissing = input.split('').some(
            (letter, index) => BARCODE_PREFIX.charAt(index) !== letter,
          );
          if (isPrefixMissing) {
            abortScan(true, 'Préfixe invalide.');
            return;
          }
        }

        // - Si on rencontre le marqueur de fin, on arrête là.
        const canHaveEndMarker = input.length > (BARCODE_PREFIX.length + BARCODE_SUFFIX.length);
        if (canHaveEndMarker && input.slice(-BARCODE_SUFFIX.length) === BARCODE_SUFFIX) {
          isScanFinished = true;
        }
      }
    }

    if (!isScanFinished) {
      // - Si le code contient plus de 50 caractère, on arrête là, ce n'est pas un code valide.
      if (input.length > (50 + (BARCODE_PREFIX.length + BARCODE_SUFFIX.length))) {
        abortScan(false, 'Code trop long');
        return;
      }

      // - On ne redispatch que si l'entrée est plus courte que le marqueur de début de scan.
      //   (sans quoi on sait que c'était un scan, mais invalide, donc on ne veut pas redispatcher)
      const shouldReDispatch = input.length < BARCODE_PREFIX.length;
      const callback = () => { abortScan(shouldReDispatch, 'Délai d\'entrée dépassé'); };
      timeoutID = setTimeout(callback, SCAN_DELAY);
      return;
    }

    const value = input.slice(BARCODE_PREFIX.length, -BARCODE_SUFFIX.length);
    input = '';

    // - On parse le code obtenu (e.g. `0001|0002` donne les args `1` et `2`)
    const splittedValue = (value.split('/').join('|')).split('|');
    const parsedValue = splittedValue.map((_value) => parseInt(_value, 10));
    if (parsedValue.some((_value) => Number.isNaN(_value))) {
      abortScan(false, `Code invalide (${value})`);
    } else {
      handler(...parsedValue);
    }

    // - Post scan time.
    isPostScanTime = true;
    setTimeout(() => { isPostScanTime = false; }, SCAN_DELAY);
  };

  console.debug('Début de l\'observation des événements scanette');
  document.addEventListener('keydown', processor);

  return () => {
    console.debug('Fin de l\'observation des événements scanette');
    document.removeEventListener('keydown', processor);
  };
};

export default observeBarcodeScan;
