import { useState } from 'react';
import { DashboardSidebar } from '../../components/DashboardSidebar';
import { useAdminData } from '../../hooks/useAdminData';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminUsers() {
  const { users, loading, updateUserRole, deleteUser } = useAdminData();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = users.filter((user: any) => {
    const roleMatch = filter === 'All' || String(user.role).toLowerCase() === filter.toLowerCase();
    const searchMatch = !searchTerm || `${user.full_name || user.name || ''} ${user.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && searchMatch;
  });

  if (loading) {
    return <div className="flex min-h-screen bg-[#f9fafb]"><DashboardSidebar type="admin" /><div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div></div>;
  }

  const handleRoleChange = async (userId: string, newRole: string) => { try { await updateUserRole(userId, newRole); toast.success('User role updated'); } catch { toast.error('Failed to update role'); } };
  const handleDeleteUser = async (userId: string) => { toast.warning('Permanently delete this user?', { description: 'This action cannot be undone.', action: { label: 'Delete', onClick: async () => { try { await deleteUser(userId); toast.success('User deleted'); } catch { toast.error('Failed to delete user'); } } }, cancel: { label: 'Cancel', onClick: () => {} } }); };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="admin" />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6"><h1 className="text-3xl font-bold text-gray-900">User Management</h1><p className="text-gray-600 mt-1">Manage farmers and buyers on the platform</p></div>
        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-3 flex-wrap"><span className="text-sm font-semibold text-gray-600">Filter:</span>{['All', 'farmer', 'buyer', 'admin'].map((role) => <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === role ? 'bg-[#16a34a] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{role}</button>)}<div className="ml-auto flex items-center gap-2"><Search className="w-4 h-4 text-gray-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users..." className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a]" /></div></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((user: any) => (<tr key={user.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-semibold text-gray-900">{user.full_name || user.name}</td><td className="px-6 py-4 text-sm text-gray-600">{user.email}</td><td className="px-6 py-4"><select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm"><option value="buyer">buyer</option><option value="farmer">farmer</option><option value="admin">admin</option></select></td><td className="px-6 py-4"><div className="flex items-center gap-2"><button className="text-sm text-[#16a34a] font-semibold hover:underline">View</button><button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div></td></tr>))}</tbody></table></div>
          </div>
        </div>
      </div>
    </div>
  );
}
