// -------------------------------------------------------------
// -
// -    Liste des devises communes
// -
// -    Source: https://gist.github.com/Fluidbyte/2973986
// -
// -------------------------------------------------------------

export type CurrencyData = {
    code: string,
    name: string,
    symbol: string,
};

const currencies: CurrencyData[] = [
    // ------------------------------------------------------
    // -
    // -    Francophones
    // -
    // ------------------------------------------------------

    {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
    },
    {
        code: 'CHF',
        symbol: 'CHF',
        name: 'Franc Suisse',
    },
    {
        code: 'CAD',
        symbol: '$',
        name: 'Dollar Canadien',
    },
    {
        code: 'BIF',
        symbol: 'FBu',
        name: 'Franc Burundais',
    },
    {
        code: 'CDF',
        symbol: 'FrCD',
        name: 'Franc Congolais',
    },
    {
        code: 'DJF',
        symbol: 'Fdj',
        name: 'Franc Djiboutien',
    },
    {
        code: 'DZD',
        symbol: 'د.ج.‏',
        name: 'Dinar Algérien',
    },
    {
        code: 'GNF',
        symbol: 'FG',
        name: 'Franc Guinéen',
    },
    {
        code: 'KMF',
        symbol: 'FC',
        name: 'Franc Comorien',
    },
    {
        code: 'MAD',
        symbol: 'د.م.‏',
        name: 'Dirham Marocain',
    },
    {
        code: 'RWF',
        symbol: 'FR',
        name: 'Franc Rwandais',
    },
    {
        code: 'TND',
        symbol: 'د.ت.‏',
        name: 'Dinar Tunisien',
    },
    {
        code: 'XAF',
        symbol: 'FCFA',
        name: 'Franc CFA (BEAC)',
    },
    {
        code: 'XOF',
        symbol: 'FCFA',
        name: 'Franc CFA (BCEAO)',
    },
    {
        code: 'XPF',
        symbol: 'CFP',
        name: 'Franc Pacifique',
    },

    // ------------------------------------------------------
    // -
    // -    Non francophones
    // -
    // ------------------------------------------------------

    {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
    },
    {
        code: 'AED',
        symbol: 'د.إ.‏',
        name: 'United Arab Emirates Dirham',
    },
    {
        code: 'AFN',
        symbol: '؋',
        name: 'Afghan Afghani',
    },
    {
        code: 'ALL',
        symbol: 'Lek',
        name: 'Albanian Lek',
    },
    {
        code: 'AMD',
        symbol: 'դր.',
        name: 'Armenian Dram',
    },
    {
        code: 'ARS',
        symbol: '$',
        name: 'Argentine Peso',
    },
    {
        code: 'AUD',
        symbol: '$',
        name: 'Australian Dollar',
    },
    {
        code: 'AZN',
        symbol: 'ман.',
        name: 'Azerbaijani Manat',
    },
    {
        code: 'BAM',
        symbol: 'KM',
        name: 'Bosnia-Herzegovina Convertible Mark',
    },
    {
        code: 'BDT',
        symbol: '৳',
        name: 'Bangladeshi Taka',
    },
    {
        code: 'BGN',
        symbol: 'лв.',
        name: 'Bulgarian Lev',
    },
    {
        code: 'BHD',
        symbol: 'د.ب.‏',
        name: 'Bahraini Dinar',
    },
    {
        code: 'BND',
        symbol: '$',
        name: 'Brunei Dollar',
    },
    {
        code: 'BOB',
        symbol: 'Bs',
        name: 'Bolivian Boliviano',
    },
    {
        code: 'BRL',
        symbol: 'R$',
        name: 'Brazilian Real',
    },
    {
        code: 'BWP',
        symbol: 'P',
        name: 'Botswana Pula',
    },
    {
        code: 'BYN',
        symbol: 'руб.',
        name: 'Belarusian Ruble',
    },
    {
        code: 'BZD',
        symbol: '$',
        name: 'Belize Dollar',
    },
    {
        code: 'CLP',
        symbol: '$',
        name: 'Chilean Peso',
    },
    {
        code: 'CNY',
        symbol: 'CN¥',
        name: 'Chinese Yuan',
    },
    {
        code: 'COP',
        symbol: '$',
        name: 'Colombian Peso',
    },
    {
        code: 'CRC',
        symbol: '₡',
        name: 'Costa Rican Colón',
    },
    {
        code: 'CVE',
        symbol: 'CV$',
        name: 'Cape Verdean Escudo',
    },
    {
        code: 'CZK',
        symbol: 'Kč',
        name: 'Czech Republic Koruna',
    },
    {
        code: 'DKK',
        symbol: 'kr',
        name: 'Danish Krone',
    },
    {
        code: 'DOP',
        symbol: 'RD$',
        name: 'Dominican Peso',
    },
    {
        code: 'EEK',
        symbol: 'kr',
        name: 'Estonian Kroon',
    },
    {
        code: 'EGP',
        symbol: 'ج.م.‏',
        name: 'Egyptian Pound',
    },
    {
        code: 'ERN',
        symbol: 'Nfk',
        name: 'Eritrean Nakfa',
    },
    {
        code: 'ETB',
        symbol: 'Br',
        name: 'Ethiopian Birr',
    },
    {
        code: 'GBP',
        symbol: '£',
        name: 'British Pound Sterling',
    },
    {
        code: 'GEL',
        symbol: 'GEL',
        name: 'Georgian Lari',
    },
    {
        code: 'GHS',
        symbol: 'GH₵',
        name: 'Ghanaian Cedi',
    },
    {
        code: 'GTQ',
        symbol: 'Q',
        name: 'Guatemalan Quetzal',
    },
    {
        code: 'HKD',
        symbol: '$',
        name: 'Hong Kong Dollar',
    },
    {
        code: 'HNL',
        symbol: 'L',
        name: 'Honduran Lempira',
    },
    {
        code: 'HRK',
        symbol: 'kn',
        name: 'Croatian Kuna',
    },
    {
        code: 'HUF',
        symbol: 'Ft',
        name: 'Hungarian Forint',
    },
    {
        code: 'IDR',
        symbol: 'Rp',
        name: 'Indonesian Rupiah',
    },
    {
        code: 'ILS',
        symbol: '₪',
        name: 'Israeli New Sheqel',
    },
    {
        code: 'INR',
        symbol: 'টকা',
        name: 'Indian Rupee',
    },
    {
        code: 'IQD',
        symbol: 'د.ع.‏',
        name: 'Iraqi Dinar',
    },
    {
        code: 'IRR',
        symbol: '﷼',
        name: 'Iranian Rial',
    },
    {
        code: 'ISK',
        symbol: 'kr',
        name: 'Icelandic Króna',
    },
    {
        code: 'JMD',
        symbol: '$',
        name: 'Jamaican Dollar',
    },
    {
        code: 'JOD',
        symbol: 'د.أ.‏',
        name: 'Jordanian Dinar',
    },
    {
        code: 'JPY',
        symbol: '￥',
        name: 'Japanese Yen',
    },
    {
        code: 'KES',
        symbol: 'Ksh',
        name: 'Kenyan Shilling',
    },
    {
        code: 'KHR',
        symbol: '៛',
        name: 'Cambodian Riel',
    },
    {
        code: 'KRW',
        symbol: '₩',
        name: 'South Korean Won',
    },
    {
        code: 'KWD',
        symbol: 'د.ك.‏',
        name: 'Kuwaiti Dinar',
    },
    {
        code: 'KZT',
        symbol: 'тңг.',
        name: 'Kazakhstani Tenge',
    },
    {
        code: 'LBP',
        symbol: 'ل.ل.‏',
        name: 'Lebanese Pound',
    },
    {
        code: 'LKR',
        symbol: 'SL Re',
        name: 'Sri Lankan Rupee',
    },
    {
        code: 'LTL',
        symbol: 'Lt',
        name: 'Lithuanian Litas',
    },
    {
        code: 'LVL',
        symbol: 'Ls',
        name: 'Latvian Lats',
    },
    {
        code: 'LYD',
        symbol: 'د.ل.‏',
        name: 'Libyan Dinar',
    },
    {
        code: 'MDL',
        symbol: 'MDL',
        name: 'Moldovan Leu',
    },
    {
        code: 'MGA',
        symbol: 'MGA',
        name: 'Malagasy Ariary',
    },
    {
        code: 'MKD',
        symbol: 'MKD',
        name: 'Macedonian Denar',
    },
    {
        code: 'MMK',
        symbol: 'K',
        name: 'Myanma Kyat',
    },
    {
        code: 'MOP',
        symbol: 'MOP$',
        name: 'Macanese Pataca',
    },
    {
        code: 'MUR',
        symbol: 'MURs',
        name: 'Mauritian Rupee',
    },
    {
        code: 'MXN',
        symbol: '$',
        name: 'Mexican Peso',
    },
    {
        code: 'MYR',
        symbol: 'RM',
        name: 'Malaysian Ringgit',
    },
    {
        code: 'MZN',
        symbol: 'MTn',
        name: 'Mozambican Metical',
    },
    {
        code: 'NAD',
        symbol: 'N$',
        name: 'Namibian Dollar',
    },
    {
        code: 'NGN',
        symbol: '₦',
        name: 'Nigerian Naira',
    },
    {
        code: 'NIO',
        symbol: 'C$',
        name: 'Nicaraguan Córdoba',
    },
    {
        code: 'NOK',
        symbol: 'kr',
        name: 'Norwegian Krone',
    },
    {
        code: 'NPR',
        symbol: 'नेरू',
        name: 'Nepalese Rupee',
    },
    {
        code: 'NZD',
        symbol: '$',
        name: 'New Zealand Dollar',
    },
    {
        code: 'OMR',
        symbol: 'ر.ع.‏',
        name: 'Omani Rial',
    },
    {
        code: 'PAB',
        symbol: 'B/.',
        name: 'Panamanian Balboa',
    },
    {
        code: 'PEN',
        symbol: 'S/.',
        name: 'Peruvian Nuevo Sol',
    },
    {
        code: 'PHP',
        symbol: '₱',
        name: 'Philippine Peso',
    },
    {
        code: 'PKR',
        symbol: '₨',
        name: 'Pakistani Rupee',
    },
    {
        code: 'PLN',
        symbol: 'zł',
        name: 'Polish Zloty',
    },
    {
        code: 'PYG',
        symbol: '₲',
        name: 'Paraguayan Guarani',
    },
    {
        code: 'QAR',
        symbol: 'ر.ق.‏',
        name: 'Qatari Rial',
    },
    {
        code: 'RON',
        symbol: 'RON',
        name: 'Romanian Leu',
    },
    {
        code: 'RSD',
        symbol: 'дин.',
        name: 'Serbian Dinar',
    },
    {
        code: 'RUB',
        symbol: '₽.',
        name: 'Russian Ruble',
    },
    {
        code: 'SAR',
        symbol: 'ر.س.‏',
        name: 'Saudi Riyal',
    },
    {
        code: 'SDG',
        symbol: 'SDG',
        name: 'Sudanese Pound',
    },
    {
        code: 'SEK',
        symbol: 'kr',
        name: 'Swedish Krona',
    },
    {
        code: 'SGD',
        symbol: '$',
        name: 'Singapore Dollar',
    },
    {
        code: 'SOS',
        symbol: 'Ssh',
        name: 'Somali Shilling',
    },
    {
        code: 'SYP',
        symbol: 'ل.س.‏',
        name: 'Syrian Pound',
    },
    {
        code: 'THB',
        symbol: '฿',
        name: 'Thai Baht',
    },
    {
        code: 'TOP',
        symbol: 'T$',
        name: 'Tongan Paʻanga',
    },
    {
        code: 'TRY',
        symbol: 'TL',
        name: 'Turkish Lira',
    },
    {
        code: 'TTD',
        symbol: '$',
        name: 'Trinidad and Tobago Dollar',
    },
    {
        code: 'TWD',
        symbol: 'NT$',
        name: 'New Taiwan Dollar',
    },
    {
        code: 'TZS',
        symbol: 'TSh',
        name: 'Tanzanian Shilling',
    },
    {
        code: 'UAH',
        symbol: '₴',
        name: 'Ukrainian Hryvnia',
    },
    {
        code: 'UGX',
        symbol: 'USh',
        name: 'Ugandan Shilling',
    },
    {
        code: 'UYU',
        symbol: '$',
        name: 'Uruguayan Peso',
    },
    {
        code: 'UZS',
        symbol: 'UZS',
        name: 'Uzbekistan Som',
    },
    {
        code: 'VEF',
        symbol: 'Bs.F.',
        name: 'Venezuelan Bolívar',
    },
    {
        code: 'VND',
        symbol: '₫',
        name: 'Vietnamese Dong',
    },
    {
        code: 'YER',
        symbol: 'ر.ي.‏',
        name: 'Yemeni Rial',
    },
    {
        code: 'ZAR',
        symbol: 'R',
        name: 'South African Rand',
    },
    {
        code: 'ZMK',
        symbol: 'ZK',
        name: 'Zambian Kwacha',
    },
    {
        code: 'ZWL',
        symbol: 'ZWL$',
        name: 'Zimbabwean Dollar',
    },
];

export default currencies;
