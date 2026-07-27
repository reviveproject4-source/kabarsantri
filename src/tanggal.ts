export function tanggalLokal(d: Date = new Date()): string {
  const tahun = d.getFullYear();
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const tanggal = String(d.getDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${tanggal}`;
}
