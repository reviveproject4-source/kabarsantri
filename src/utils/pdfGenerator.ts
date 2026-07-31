import { RekapMuridPaud } from '../types/paudTypes';

export const generateRaporPDF = (murid: RekapMuridPaud, namaSekolah: string = 'CeritaAnanda PAUD') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rapor Perkembangan - ${murid.nama}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700;900&display=swap');
          body {
            font-family: 'Quicksand', sans-serif;
            background-color: #ffffff;
            color: #1e293b;
            margin: 0;
            padding: 24px;
          }
          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 24px;
            border-radius: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .badge {
            background: #fbbf24;
            color: #78350f;
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: 900;
            font-size: 14px;
          }
          .card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 16px;
            margin-top: 16px;
          }
          .title {
            font-size: 18px;
            font-weight: 900;
            color: #1e1b4b;
            margin-bottom: 12px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .score-box {
            background: white;
            border: 1px solid #cbd5e1;
            padding: 12px;
            border-radius: 12px;
            text-align: center;
          }
          .score-val {
            font-size: 24px;
            font-weight: 900;
            color: #059669;
          }
          .catatan {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
          }
          .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <span style="font-size: 12px; font-weight: 700; opacity: 0.9;">${namaSekolah}</span>
            <h1 style="margin: 4px 0 0 0; font-size: 24px;">Rapor Perkembangan Ananda</h1>
          </div>
          <div class="badge">Usia ${murid.kategoriUsia.replace('_tahun', ' Tahun')}</div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; margin-top: 20px;">
          <div style="font-size: 50px; background: #e0e7ff; padding: 12px; border-radius: 20px;">${murid.fotoEmoji}</div>
          <div>
            <h2 style="margin: 0; font-size: 22px; color: #1e293b;">${murid.nama} (${murid.panggilan})</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">ID Murid: ${murid.id} • Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        <!-- LOGIKA & KOGNITIF -->
        <div class="card">
          <div class="title">🧠 Domain Logika & Kognitif</div>
          <div class="grid">
            <div class="score-box">
              <div style="font-size: 11px; color: #64748b;">Pencocokan Bentuk</div>
              <div class="score-val">${murid.skorLogika.pencocokanBentuk}%</div>
            </div>
            <div class="score-box">
              <div style="font-size: 11px; color: #64748b;">Mengurutkan Ukuran</div>
              <div class="score-val">${murid.skorLogika.mengurutkanUkuran}%</div>
            </div>
            <div class="score-box">
              <div style="font-size: 11px; color: #64748b;">Menghitung Benda</div>
              <div class="score-val">${murid.skorLogika.menghitungBenda}%</div>
            </div>
            <div class="score-box">
              <div style="font-size: 11px; color: #64748b;">Pola Urutan Warna</div>
              <div class="score-val">${murid.skorLogika.polaWarna}%</div>
            </div>
          </div>
        </div>

        <!-- MOTORIK HALUS -->
        <div class="card">
          <div class="title">✍️ Domain Motorik Halus</div>
          <div class="grid">
            <div class="score-box">
              <div style="font-size: 11px; color: #64748b;">Tracing Garis</div>
              <div class="score-val">${murid.skorMotorikHalus.tracingGaris}%</div>
            </div>
            <div class="score-box">
              <div style="font-size: 11px; color: #64748b;">Puzzle Kepingan</div>
              <div class="score-val">${murid.skorMotorikHalus.puzzleBentuk}%</div>
            </div>
          </div>
        </div>

        <!-- MOTORIK KASAR -->
        <div class="card">
          <div class="title">🏃 Domain Motorik Kasar & Fisik</div>
          ${
            murid.evaluasiMotorikKasar.length === 0
              ? '<p style="font-size: 13px; color: #94a3b8;">Belum ada aktivitas fisik yang dicatat.</p>'
              : murid.evaluasiMotorikKasar
                  .slice(0, 3)
                  .map(
                    (ev) => `
              <div class="catatan" style="margin-bottom: 8px;">
                <strong>Bulan #${ev.bulan} - ${ev.namaAktivitas} (${ev.status.replace(/_/g, ' ')})</strong>
                ${ev.catatanGuru ? `<br/><em>"${ev.catatanGuru}"</em>` : ''}
              </div>
            `
                  )
                  .join('')
          }
        </div>

        <div class="footer">
          Laporan Otomatis Sistem CeritaAnanda PAUD • Dokumen Resmi Pendidikan Anak Usia Dini
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
