import React from 'react';
import { useSantriList } from './hooks/useSantri';

export function ModulWaliSantri() {
  const { data: santriList = [] } = useSantriList();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Master Wali Santri</h1>
        <p className="text-sm text-gray-500 mt-1">
          Data wali diisi otomatis dari form Tambah Santri, tidak perlu input
          terpisah.
        </p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Nama Ayah</th>
              <th className="p-4 text-left">Pekerjaan Ayah</th>
              <th className="p-4 text-left">Kontak Ayah</th>
              <th className="p-4 text-left">Nama Ibu</th>
              <th className="p-4 text-left">Pekerjaan Ibu</th>
              <th className="p-4 text-left">Kontak Ibu</th>
              <th className="p-4 text-left">Alamat</th>
            </tr>
          </thead>

          <tbody>
            {santriList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8 text-gray-500">
                  Belum ada data wali santri
                </td>
              </tr>
            ) : (
              santriList.map((santri: any) => (
                <tr key={santri.id} className="border-t">
                  <td className="p-4">{santri.nama}</td>
                  <td className="p-4">{santri.namaAyah || '-'}</td>
                  <td className="p-4">{santri.pekerjaanAyah || '-'}</td>
                  <td className="p-4">{santri.noHpAyah || '-'}</td>
                  <td className="p-4">{santri.namaIbu || '-'}</td>
                  <td className="p-4">{santri.pekerjaanIbu || '-'}</td>
                  <td className="p-4">{santri.noHpIbu || '-'}</td>
                  <td className="p-4">{santri.alamatWali || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
