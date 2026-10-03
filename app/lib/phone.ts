export const NO_HP_MAX_LENGTH = 30;
export const NO_HP_MIN_DIGITS = 8;

const FORMATTING_ALLOWED = /[^0-9+\-() ]/g;

/**
 * Bentuk simpan: hanya boleh angka, "+", "-", spasi, kurung.
 * "+62", "62", "0", dan format bebas lain tetap disimpan apa adanya
 * supaya user bebas mengetik format kesukaannya.
 */
export function cleanNoHp(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(FORMATTING_ALLOWED, '').trim().slice(0, NO_HP_MAX_LENGTH);
}

export function noHpDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Kanonik lokal (awalan 0) untuk membandingkan nomor yang ditulis
 * dengan format berbeda, mis. "0812...", "+62812...", "62 812...".
 */
export function canonicalNoHp(value: string): string {
  let digits = noHpDigits(value);

  if (digits.startsWith('62')) {
    digits = `0${digits.slice(2)}`;
  } else if (digits && !digits.startsWith('0')) {
    digits = `0${digits}`;
  }

  return digits;
}

/**
 * Semua ejaan yang mungkin tersimpan untuk nomor yang sama,
 * dipakai pengecekan duplikasi tanpa scan seluruh tabel.
 */
export function noHpVariants(value: string): string[] {
  const local = canonicalNoHp(value);
  const withoutPlus = noHpDigits(local).replace(/^0/, '');

  return Array.from(
    new Set([
      local,
      `+${local.replace(/^0/, '')}`,
      `62${withoutPlus}`,
      `0${withoutPlus}`,
      value.trim(),
    ].filter(Boolean))
  );
}

export function isValidNoHp(value: string): boolean {
  if (!value) return false;
  if (value.length > NO_HP_MAX_LENGTH) return false;

  const digits = noHpDigits(value);
  return digits.length >= NO_HP_MIN_DIGITS;
}
