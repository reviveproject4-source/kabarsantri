export function normalisasiNomorHp(nomor: string): string {
  const bersih = nomor.replace(/[^0-9]/g, '');
  if (bersih.startsWith('0')) return `62${bersih.slice(1)}`;
  if (bersih.startsWith('8')) return `62${bersih}`;
  return bersih;
}
