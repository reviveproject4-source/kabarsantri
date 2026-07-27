import React from 'react';

export interface AnggotaGrupKomunikasi {
  id: string | number;
  nama: string;
  jabatan: string;
  email: string;
}

export function GrupKomunikasiCard({
  judul,
  deskripsi,
  anggota,
}: {
  judul: string;
  deskripsi: string;
  anggota: AnggotaGrupKomunikasi[];
}) {
  const emailTersedia = anggota.filter((p) => p.email).map((p) => p.email);

  const salinEmail = () => {
    navigator.clipboard.writeText(emailTersedia.join(', '));
  };

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-start gap-3">
        <div>
          <h4 className="font-semibold">{judul}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{deskripsi}</p>
        </div>
        <button
          onClick={salinEmail}
          disabled={emailTersedia.length === 0}
          className="text-sm text-blue-600 underline whitespace-nowrap disabled:text-gray-300 disabled:no-underline"
        >
          Salin Email
        </button>
      </div>

      {anggota.length === 0 ? (
        <p className="text-sm text-gray-400 p-4">Belum ada anggota</p>
      ) : (
        <table className="w-full">
          <tbody>
            {anggota.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 pl-4">
                  <div>{p.nama}</div>
                  <div className="text-xs text-gray-500">{p.jabatan}</div>
                </td>
                <td className="p-3 pr-4 text-right text-sm">
                  {p.email || (
                    <span className="text-gray-400">belum ada akun</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
