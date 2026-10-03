import { redirect } from 'next/navigation';

export default function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect('/dashboard/admin/users');
}
