import { redirect } from 'next/navigation';

export default function AssignKelasRedirectPage() {
  redirect('/dashboard/mudir?tab=assign_kelas');
}
