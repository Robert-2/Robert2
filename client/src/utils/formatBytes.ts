/**
 * Formate un nombre selon son ordre de grandeur en octets (Bytes, KB, MB, TB, etc.).
 *
 * @param sizeInBytes - Le nombre à afficher en octets.
 *
 * @returns Une chaîne de caractère avec la valeur formatée en octets.
 */
const formatBytes = (sizeInBytes: number): string => {
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
