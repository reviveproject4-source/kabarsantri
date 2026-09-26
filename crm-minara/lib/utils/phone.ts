/**
 * Normalizes phone numbers to standard E.164 format (e.g. 08123456789 -> 628123456789)
 * Used across Universal Importer and Manual Input forms.
 */
export function normalizePhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters except leading +
  let cleaned = phone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 0, replace with 62 (Indonesian country code default)
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }

  // If phone number starts with 8 (e.g. 8123456789), prepend 62
  if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}
