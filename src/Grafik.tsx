import React from 'react';

export const WARNA_STATUS = {
  baik: '#0ca30c',
  peringatan: '#fab219',
  serius: '#ec835a',
  kritis: '#d03b3b',
};

export const WARNA_SERI = {
  biru: '#2a78d6',
  aqua: '#1baf7a',
  kuning: '#eda100',
  hijau: '#008300',
  ungu: '#4a3aa7',
  merah: '#e34948',
  magenta: '#e87ba4',
  oranye: '#eb6834',
};

const TINTA_SEKUNDER = '#898781';
const GRID = '#e1e0d9';
const SUMBU = '#c3c2b7';
const SURFACE = '#ffffff';

function skalaBulat(nilai: number): number {
  if (nilai <= 5) return 5;
  const magnitudo = Math.pow(10, Math.floor(Math.log10(nilai)));
  const langkah = [1, 2, 5, 10];
  for (const l of langkah) {
    if (nilai <= l * magnitudo) return l * magnitudo;
  }
  return Math.ceil(nilai / magnitudo) * magnitudo;
}

export function bulanEnamTerakhir(): { key: string; label: string }[] {
  const namaBulan = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const sekarang = new Date();
  const hasil: { key: string; label: string }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    hasil.push({ key, label: namaBulan[d.getMonth()] });
  }

  return hasil;
}

export function bulanDariTanggal(tanggal: string): string {
  return tanggal.slice(0, 7);
}

interface SeriBar {
  nama: string;
  warna: string;
  nilai: number[];
}

interface GrafikBarProps {
  kategori: string[];
  seri: SeriBar[];
  tinggi?: number;
  warnaPerKategori?: string[];
  formatNilai?: (nilai: number) => string;
}

export function GrafikBar({
  kategori,
  seri,
  tinggi = 220,
  warnaPerKategori,
  formatNilai,
}: GrafikBarProps) {
  const lebar = 640;
  const paddingKiri = 32;
  const paddingKanan = 12;
  const paddingBawah = 26;
  const paddingAtas = formatNilai ? 28 : 16;
  const tinggiPlot = tinggi - paddingBawah - paddingAtas;
  const lebarPlot = lebar - paddingKiri - paddingKanan;

  const nilaiMaks = skalaBulat(Math.max(1, ...seri.flatMap((s) => s.nilai)));
  const lebarGrup = lebarPlot / Math.max(kategori.length, 1);
  const jumlahSeri = Math.max(seri.length, 1);
  const lebarBar = Math.min(20, (lebarGrup - 8) / jumlahSeri - 3);

  const garisGrid = [0, 0.5, 1];

  return (
    <div>
      <svg viewBox={`0 0 ${lebar} ${tinggi}`} className="w-full" role="img">
        {garisGrid.map((f) => {
          const y = paddingAtas + tinggiPlot * (1 - f);
          return (
            <line
              key={f}
              x1={paddingKiri}
              x2={lebar - paddingKanan}
              y1={y}
              y2={y}
              stroke={GRID}
              strokeWidth={1}
            />
          );
        })}

        {garisGrid.map((f) => (
          <text
            key={f}
            x={paddingKiri - 6}
            y={paddingAtas + tinggiPlot * (1 - f) + 3}
            fontSize={9}
            fill={TINTA_SEKUNDER}
            textAnchor="end"
          >
            {Math.round(nilaiMaks * f)}
          </text>
        ))}

        {kategori.map((label, ki) => {
          const xGrup = paddingKiri + ki * lebarGrup;
          const totalLebarBar = jumlahSeri * (lebarBar + 3) - 3;
          const xMulai = xGrup + (lebarGrup - totalLebarBar) / 2;

          return (
            <g key={label}>
              {seri.map((s, si) => {
                const nilai = s.nilai[ki] ?? 0;
                const tinggiBar = (nilai / nilaiMaks) * tinggiPlot;
                const x = xMulai + si * (lebarBar + 3);
                const y = paddingAtas + tinggiPlot - tinggiBar;

                return (
                  <g key={s.nama}>
                    <rect
                      x={x}
                      y={y}
                      width={Math.max(lebarBar, 1)}
                      height={Math.max(tinggiBar, 0)}
                      rx={3}
                      fill={warnaPerKategori?.[ki] ?? s.warna}
                    >
                      <title>{`${s.nama} · ${label}: ${nilai}`}</title>
                    </rect>

                    {formatNilai && (
                      <text
                        x={x + Math.max(lebarBar, 1) / 2}
                        y={y - 5}
                        fontSize={9}
                        fontWeight={600}
                        fill="#0b0b0b"
                        textAnchor="middle"
                      >
                        {formatNilai(nilai)}
                      </text>
                    )}
                  </g>
                );
              })}

              <text
                x={xGrup + lebarGrup / 2}
                y={tinggi - 8}
                fontSize={10}
                fill={TINTA_SEKUNDER}
                textAnchor="middle"
              >
                {label}
              </text>
            </g>
          );
        })}

        <line
          x1={paddingKiri}
          x2={paddingKiri}
          y1={paddingAtas}
          y2={paddingAtas + tinggiPlot}
          stroke={SUMBU}
          strokeWidth={1}
        />
        <line
          x1={paddingKiri}
          x2={lebar - paddingKanan}
          y1={paddingAtas + tinggiPlot}
          y2={paddingAtas + tinggiPlot}
          stroke={SUMBU}
          strokeWidth={1}
        />
      </svg>

      {warnaPerKategori ? (
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {kategori.map((label, ki) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs text-gray-600"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: warnaPerKategori[ki] }}
              />
              {label}
            </div>
          ))}
        </div>
      ) : (
        seri.length > 1 && (
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {seri.map((s) => (
              <div
                key={s.nama}
                className="flex items-center gap-1.5 text-xs text-gray-600"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.warna }}
                />
                {s.nama}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

interface GrafikGarisProps {
  kategori: string[];
  nilai: number[];
  warna?: string;
  tinggi?: number;
}

export function GrafikGaris({
  kategori,
  nilai,
  warna = WARNA_SERI.biru,
  tinggi = 200,
}: GrafikGarisProps) {
  const lebar = 640;
  const paddingKiri = 32;
  const paddingKanan = 36;
  const paddingBawah = 26;
  const paddingAtas = 16;
  const tinggiPlot = tinggi - paddingBawah - paddingAtas;
  const lebarPlot = lebar - paddingKiri - paddingKanan;

  const nilaiMaks = skalaBulat(Math.max(1, ...nilai));
  const n = kategori.length;
  const langkahX = n > 1 ? lebarPlot / (n - 1) : 0;

  const titik = nilai.map((v, i) => ({
    x: paddingKiri + i * langkahX,
    y: paddingAtas + tinggiPlot - (v / nilaiMaks) * tinggiPlot,
  }));

  const garisPath = titik
    .map((t, i) => `${i === 0 ? 'M' : 'L'} ${t.x} ${t.y}`)
    .join(' ');

  const garisGrid = [0, 0.5, 1];
  const titikAkhir = titik[titik.length - 1];

  return (
    <svg viewBox={`0 0 ${lebar} ${tinggi}`} className="w-full" role="img">
      {garisGrid.map((f) => {
        const y = paddingAtas + tinggiPlot * (1 - f);
        return (
          <line
            key={f}
            x1={paddingKiri}
            x2={lebar - paddingKanan}
            y1={y}
            y2={y}
            stroke={GRID}
            strokeWidth={1}
          />
        );
      })}

      {garisGrid.map((f) => (
        <text
          key={f}
          x={paddingKiri - 6}
          y={paddingAtas + tinggiPlot * (1 - f) + 3}
          fontSize={9}
          fill={TINTA_SEKUNDER}
          textAnchor="end"
        >
          {Math.round(nilaiMaks * f)}
        </text>
      ))}

      {titik.length > 1 && (
        <path
          d={garisPath}
          fill="none"
          stroke={warna}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {titik.map((t, i) => (
        <circle
          key={i}
          cx={t.x}
          cy={t.y}
          r={4}
          fill={warna}
          stroke={SURFACE}
          strokeWidth={2}
        >
          <title>{`${kategori[i]}: ${nilai[i]}`}</title>
        </circle>
      ))}

      {titikAkhir && (
        <text
          x={titikAkhir.x - 6}
          y={titikAkhir.y - 8}
          fontSize={11}
          fontWeight={600}
          fill="#0b0b0b"
          textAnchor="end"
        >
          {nilai[nilai.length - 1]}
        </text>
      )}

      {kategori.map((label, i) => (
        <text
          key={label}
          x={paddingKiri + i * langkahX}
          y={tinggi - 8}
          fontSize={10}
          fill={TINTA_SEKUNDER}
          textAnchor="middle"
        >
          {label}
        </text>
      ))}

      <line
        x1={paddingKiri}
        x2={paddingKiri}
        y1={paddingAtas}
        y2={paddingAtas + tinggiPlot}
        stroke={SUMBU}
        strokeWidth={1}
      />
      <line
        x1={paddingKiri}
        x2={lebar - paddingKanan}
        y1={paddingAtas + tinggiPlot}
        y2={paddingAtas + tinggiPlot}
        stroke={SUMBU}
        strokeWidth={1}
      />
    </svg>
  );
}

interface IrisanDonut {
  nama: string;
  nilai: number;
  warna: string;
}

interface GrafikDonutProps {
  data: IrisanDonut[];
  ukuran?: number;
  labelTotal?: string;
}

export function GrafikDonut({
  data,
  ukuran = 150,
  labelTotal = 'total',
}: GrafikDonutProps) {
  const total = data.reduce((t, d) => t + d.nilai, 0);
  const radius = ukuran / 2;
  const strokeWidth = radius * 0.34;
  const radiusDalam = radius - strokeWidth / 2;
  const keliling = 2 * Math.PI * radiusDalam;

  let offsetKumulatif = 0;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg
        width={ukuran}
        height={ukuran}
        viewBox={`0 0 ${ukuran} ${ukuran}`}
        role="img"
      >
        <g transform={`rotate(-90 ${radius} ${radius})`}>
          {total === 0 ? (
            <circle
              cx={radius}
              cy={radius}
              r={radiusDalam}
              fill="none"
              stroke={GRID}
              strokeWidth={strokeWidth}
            />
          ) : (
            data.map((d) => {
              const panjang = (d.nilai / total) * keliling;
              const celah = data.length > 1 ? 2 : 0;
              const dash = `${Math.max(panjang - celah, 0)} ${
                keliling - panjang + celah
              }`;
              const offsetSaatIni = offsetKumulatif;
              offsetKumulatif += panjang;

              return (
                <circle
                  key={d.nama}
                  cx={radius}
                  cy={radius}
                  r={radiusDalam}
                  fill="none"
                  stroke={d.warna}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dash}
                  strokeDashoffset={-offsetSaatIni}
                >
                  <title>{`${d.nama}: ${d.nilai} (${Math.round(
                    (d.nilai / total) * 100
                  )}%)`}</title>
                </circle>
              );
            })
          )}
        </g>

        <text
          x={radius}
          y={radius - 3}
          textAnchor="middle"
          fontSize={18}
          fontWeight={700}
          fill="#0b0b0b"
        >
          {total}
        </text>
        <text
          x={radius}
          y={radius + 14}
          textAnchor="middle"
          fontSize={9}
          fill={TINTA_SEKUNDER}
        >
          {labelTotal}
        </text>
      </svg>

      <div className="space-y-1.5">
        {data.map((d) => (
          <div
            key={d.nama}
            className="flex items-center gap-2 text-xs text-gray-600"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: d.warna }}
            />
            <span>{d.nama}</span>
            <span className="font-semibold text-gray-800 ml-2">
              {total > 0 ? Math.round((d.nilai / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
