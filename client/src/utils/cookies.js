import CookiesBase from 'js-cookie';

// @see "Return Values" - http://php.net/manual/en/function.urlencode.php
// @see https://github.com/js-cookie/js-cookie/blob/master/SERVER_SIDE.md#php
const Cookies = CookiesBase.withConverter({
    write(value) {
        return (
            encodeURIComponent(value)
                // Revert the characters that are unnecessarily encoded but are
                // allowed in a cookie value, except for the plus sign (%2B)
                .replace(
                    /%(?:23|24|26|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                    decodeURIComponent,
                )
        );
    },
    read(value) {
        return (
            value
                // Decode the plus sign to spaces first, otherwise "legit"
                // encoded pluses will be replaced incorrectly
                .replace(/\+/g, ' ')
                .replace(/(?:%[0-9A-Z]{2})+/g, decodeURIComponent)
        );
    },
});

export default Cookies;
