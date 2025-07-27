import { COUNTRIES_WITH_PHONE_DATA, VALIDATION } from './constants';

/**
 * Service for detecting user's country and handling phone number formatting
 */
class CountryDetectionService {
  /**
   * Detect user's country based on browser locale and fallback methods
   * @returns {Promise<string>} Country code
   */
  static async detectCountry() {
    try {
      // Try browser locale first
      const browserCountry = this.getCountryFromLocale();
      if (browserCountry && this.isValidCountryCode(browserCountry)) {
        return browserCountry;
      }

      // Try timezone-based detection
      const timezoneCountry = this.getCountryFromTimezone();
      if (timezoneCountry && this.isValidCountryCode(timezoneCountry)) {
        return timezoneCountry;
      }

      // Fallback to default
      return 'US';
    } catch (error) {
      console.warn('Country detection failed:', error);
      return 'US';
    }
  }

  /**
   * Get country code from browser locale
   * @returns {string|null} Country code or null
   */
  static getCountryFromLocale() {
    try {
      const locale = navigator.language || navigator.languages?.[0];
      if (!locale) return null;

      // Extract country code from locale (e.g., 'en-US' -> 'US')
      const parts = locale.split('-');
      if (parts.length > 1) {
        return parts[1].toUpperCase();
      }

      // Handle special cases for language-only locales
      const languageToCountry = {
        'en': 'US',
        'sw': 'KE', // Swahili -> Kenya
        'fr': 'FR',
        'de': 'DE',
        'es': 'ES',
        'pt': 'BR',
        'ar': 'SA',
        'zh': 'CN',
        'ja': 'JP',
        'ko': 'KR',
        'hi': 'IN',
        'th': 'TH',
        'vi': 'VN',
        'id': 'ID',
        'ms': 'MY',
        'ur': 'PK',
        'bn': 'BD',
        'si': 'LK',
        'ne': 'NP',
        'fa': 'IR',
        'he': 'IL',
        'tr': 'TR',
        'ru': 'RU',
        'uk': 'UA',
        'pl': 'PL',
        'cs': 'CZ',
        'hu': 'HU',
        'ro': 'RO',
        'bg': 'BG',
        'el': 'GR',
        'sv': 'SE',
        'no': 'NO',
        'da': 'DK',
        'fi': 'FI',
        'nl': 'NL',
        'it': 'IT'
      };

      const languageCode = parts[0].toLowerCase();
      return languageToCountry[languageCode] || null;
    } catch (error) {
      console.warn('Failed to get country from locale:', error);
      return null;
    }
  }

  /**
   * Get country code from timezone (basic mapping)
   * @returns {string|null} Country code or null
   */
  static getCountryFromTimezone() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!timezone) return null;

      // Basic timezone to country mapping
      const timezoneToCountry = {
        'America/New_York': 'US',
        'America/Chicago': 'US',
        'America/Denver': 'US',
        'America/Los_Angeles': 'US',
        'America/Toronto': 'CA',
        'America/Vancouver': 'CA',
        'Europe/London': 'GB',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE',
        'Europe/Rome': 'IT',
        'Europe/Madrid': 'ES',
        'Europe/Amsterdam': 'NL',
        'Europe/Brussels': 'BE',
        'Europe/Zurich': 'CH',
        'Europe/Vienna': 'AT',
        'Europe/Stockholm': 'SE',
        'Europe/Oslo': 'NO',
        'Europe/Copenhagen': 'DK',
        'Europe/Helsinki': 'FI',
        'Europe/Warsaw': 'PL',
        'Europe/Prague': 'CZ',
        'Europe/Budapest': 'HU',
        'Europe/Bucharest': 'RO',
        'Europe/Sofia': 'BG',
        'Europe/Athens': 'GR',
        'Europe/Istanbul': 'TR',
        'Europe/Moscow': 'RU',
        'Europe/Kiev': 'UA',
        'Asia/Tokyo': 'JP',
        'Asia/Seoul': 'KR',
        'Asia/Shanghai': 'CN',
        'Asia/Hong_Kong': 'CN',
        'Asia/Taipei': 'CN',
        'Asia/Bangkok': 'TH',
        'Asia/Ho_Chi_Minh': 'VN',
        'Asia/Manila': 'PH',
        'Asia/Jakarta': 'ID',
        'Asia/Kuala_Lumpur': 'MY',
        'Asia/Singapore': 'SG',
        'Asia/Kolkata': 'IN',
        'Asia/Karachi': 'PK',
        'Asia/Dhaka': 'BD',
        'Asia/Colombo': 'LK',
        'Asia/Kathmandu': 'NP',
        'Asia/Kabul': 'AF',
        'Asia/Tehran': 'IR',
        'Asia/Baghdad': 'IQ',
        'Asia/Riyadh': 'SA',
        'Asia/Dubai': 'AE',
        'Asia/Doha': 'QA',
        'Asia/Kuwait': 'KW',
        'Asia/Bahrain': 'BH',
        'Asia/Muscat': 'OM',
        'Asia/Amman': 'JO',
        'Asia/Beirut': 'LB',
        'Asia/Damascus': 'SY',
        'Asia/Jerusalem': 'IL',
        'Asia/Nicosia': 'CY',
        'Africa/Cairo': 'EG',
        'Africa/Casablanca': 'MA',
        'Africa/Lagos': 'NG',
        'Africa/Nairobi': 'KE',
        'Africa/Dar_es_Salaam': 'TZ',
        'Africa/Kampala': 'UG',
        'Africa/Kigali': 'RW',
        'Africa/Addis_Ababa': 'ET',
        'Africa/Accra': 'GH',
        'Africa/Johannesburg': 'ZA',
        'Australia/Sydney': 'AU',
        'Australia/Melbourne': 'AU',
        'Australia/Perth': 'AU',
        'Pacific/Auckland': 'NZ',
        'America/Sao_Paulo': 'BR',
        'America/Mexico_City': 'MX',
        'America/Buenos_Aires': 'AR'
      };

      return timezoneToCountry[timezone] || null;
    } catch (error) {
      console.warn('Failed to get country from timezone:', error);
      return null;
    }
  }

  /**
   * Check if country code is valid and supported
   * @param {string} countryCode Country code to validate
   * @returns {boolean} True if valid
   */
  static isValidCountryCode(countryCode) {
    return COUNTRIES_WITH_PHONE_DATA.some(country => country.code === countryCode);
  }

  /**
   * Get country data by country code
   * @param {string} countryCode Country code
   * @returns {Object|null} Country data or null
   */
  static getCountryData(countryCode) {
    return COUNTRIES_WITH_PHONE_DATA.find(country => country.code === countryCode) || null;
  }

  /**
   * Format phone number according to country rules
   * @param {string} number Phone number to format
   * @param {string} countryCode Country code
   * @returns {string} Formatted phone number
   */
  static formatPhoneNumber(number, countryCode) {
    if (!number || !countryCode) return number;

    const countryData = this.getCountryData(countryCode);
    if (!countryData) return number;

    // Remove all non-digit characters except +
    let cleanNumber = number.replace(/[^\d+]/g, '');

    // If number doesn't start with country code, add it
    if (!cleanNumber.startsWith(countryData.phoneCode)) {
      // Remove leading + or country code if present
      cleanNumber = cleanNumber.replace(/^\+/, '').replace(new RegExp(`^${countryData.phoneCode.slice(1)}`), '');
      cleanNumber = countryData.phoneCode + cleanNumber;
    }

    // Apply country-specific formatting
    return this.applyPhoneFormat(cleanNumber, countryData.format);
  }

  /**
   * Apply formatting pattern to phone number
   * @param {string} number Clean phone number
   * @param {string} format Format pattern (e.g., '+1 (XXX) XXX-XXXX')
   * @returns {string} Formatted phone number
   */
  static applyPhoneFormat(number, format) {
    if (!number || !format) return number;

    let formattedNumber = format;
    let digitIndex = 0;

    // Replace X's with digits from the number
    for (let i = 0; i < formattedNumber.length && digitIndex < number.length; i++) {
      if (formattedNumber[i] === 'X') {
        formattedNumber = formattedNumber.substring(0, i) + number[digitIndex] + formattedNumber.substring(i + 1);
        digitIndex++;
      }
    }

    // Remove any remaining X's
    formattedNumber = formattedNumber.replace(/X/g, '');

    return formattedNumber;
  }

  /**
   * Validate phone number against country pattern
   * @param {string} number Phone number to validate
   * @param {string} countryCode Country code
   * @returns {boolean} True if valid
   */
  static validatePhoneNumber(number, countryCode) {
    if (!number || !countryCode) return false;

    const pattern = VALIDATION.PHONE.PATTERNS[countryCode];
    if (!pattern) return false;

    return pattern.test(number);
  }

  /**
   * Get phone number example for country
   * @param {string} countryCode Country code
   * @returns {string} Example phone number
   */
  static getPhoneExample(countryCode) {
    const countryData = this.getCountryData(countryCode);
    return countryData?.example || '';
  }

  /**
   * Clean phone number input (remove invalid characters)
   * @param {string} input Raw input
   * @returns {string} Cleaned input
   */
  static cleanPhoneInput(input) {
    if (!input) return '';
    
    // Allow digits, spaces, parentheses, hyphens, and plus sign
    return input.replace(/[^\d\s\(\)\-\+]/g, '');
  }

  /**
   * Get all supported countries sorted by name
   * @returns {Array} Array of country data
   */
  static getAllCountries() {
    return [...COUNTRIES_WITH_PHONE_DATA].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Search countries by name or code
   * @param {string} query Search query
   * @returns {Array} Filtered countries
   */
  static searchCountries(query) {
    if (!query) return this.getAllCountries();

    const lowerQuery = query.toLowerCase();
    return COUNTRIES_WITH_PHONE_DATA.filter(country => 
      country.name.toLowerCase().includes(lowerQuery) ||
      country.code.toLowerCase().includes(lowerQuery) ||
      country.phoneCode.includes(query)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Store user's country preference
   * @param {string} countryCode Country code to store
   */
  static storeCountryPreference(countryCode) {
    try {
      localStorage.setItem('userCountryPreference', countryCode);
    } catch (error) {
      console.warn('Failed to store country preference:', error);
    }
  }

  /**
   * Get stored country preference
   * @returns {string|null} Stored country code or null
   */
  static getStoredCountryPreference() {
    try {
      return localStorage.getItem('userCountryPreference');
    } catch (error) {
      console.warn('Failed to get stored country preference:', error);
      return null;
    }
  }

  /**
   * Get country preference with fallback to detection
   * @returns {Promise<string>} Country code
   */
  static async getCountryPreference() {
    // Try stored preference first
    const stored = this.getStoredCountryPreference();
    if (stored && this.isValidCountryCode(stored)) {
      return stored;
    }

    // Fall back to detection
    return await this.detectCountry();
  }
}

export default CountryDetectionService;