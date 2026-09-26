export function normalisasiNomorHp(nomor: string): string {
  const bersih = nomor.replace(/[^0-9]/g, '');
  if (bersih.startsWith('0')) return `62${bersih.slice(1)}`;
  if (bersih.startsWith('8')) return `62${bersih}`;
  return bersih;
}

export function openDirectWA(nomor: string, pesan = '') {
  let clean = nomor.replace(/[^0-9]/g, '');

  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  }

  const encodedPesan = encodeURIComponent(pesan);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href =
      `whatsapp://send?phone=${clean}&text=${encodedPesan}`;
  } else {
    window.open(
      `https://web.whatsapp.com/send?phone=${clean}&text=${encodedPesan}`,
      '_blank'
    );
  }
}
