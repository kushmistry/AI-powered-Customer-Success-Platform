'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  fetchUsers,
  updateUser,
  deleteUser,
  setUserFilters,
} from '@/lib/features/users/userSlice';
import { User, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import { Popconfirm, Button, Modal, Input, Select, Tag, Spin, Alert, Empty, Pagination } from '@e2m/ui';
import {
  ShieldCheck,
  Shield,
  User as UserIcon,
  Mail,
  Edit2,
  Trash2,
  Users as UsersIcon,
  RefreshCw,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersManagementPage() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const {
    list: users,
    total,
    page,
    size,
    pages,
    loading,
    actionLoading,
    error,
    filters,
  } = useAppSelector((state) => state.users);

  // Edit User Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>(UserRole.VIEWER);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers(filters));
    }
  }, [dispatch, isAdmin, filters]);

  const handleOpenEdit = (targetUser: User) => {
    setEditingUser(targetUser);
    setEditName(targetUser.full_name);
    setEditEmail(targetUser.email);
    setEditRole(targetUser.role);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim() || !editEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }

    const res = await dispatch(
      updateUser({
        id: editingUser.id,
        data: {
          full_name: editName.trim(),
          email: editEmail.trim(),
          role: editRole,
        },
      })
    );

    if (updateUser.fulfilled.match(res)) {
      toast.success('User updated successfully');
      setEditModalOpen(false);
    } else {
      toast.error((res.payload as string) || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await dispatch(deleteUser(userId));
    if (deleteUser.fulfilled.match(res)) {
      toast.success('User deleted successfully');
    } else {
      toast.error((res.payload as string) || 'Failed to delete user');
    }
  };

  const handlePageChange = (p: number) => {
    dispatch(setUserFilters({ page: p }));
  };

  const handleRefresh = () => {
    dispatch(fetchUsers(filters));
  };


  const getRoleTagColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'manager':
        return 'blue';
      default:
        return 'default';
    }
  };

  // If not admin, show Access Denied
  if (!isAdmin) {
    return (
      <DashboardLayout title="Team Management">
        <div className="max-w-2xl mx-auto py-12">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Access Required</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You are currently logged in with the <span className="font-semibold uppercase">{currentUser?.role}</span> role. Only users with the <span className="font-semibold">Admin</span> role have permission to manage team members and role assignments.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Count summaries
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === UserRole.ADMIN).length;
  const managerCount = users.filter((u) => u.role === UserRole.MANAGER).length;
  const viewerCount = users.filter((u) => u.role === UserRole.VIEWER).length;

  return (
    <DashboardLayout title="Team & User Management">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <UsersIcon className="h-4 w-4 text-slate-400" />
            <span>Total Team</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>Admins</span>
          </div>
          <p className="text-2xl font-bold text-purple-950">{adminCount}</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Managers</span>
          </div>
          <p className="text-2xl font-bold text-blue-950">{managerCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserIcon className="h-4 w-4 text-slate-500" />
            <span>Viewers</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{viewerCount}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Registered Users</h3>
            <p className="text-xs text-slate-500">Manage user roles, credentials, and access permissions</p>
          </div>
          <Button
            onClick={handleRefresh}
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            size="small"
            className="rounded-lg text-xs"
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4">
            <Alert message="Error loading team" description={error} type="error" showIcon />
          </div>
        )}

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-12">
            <Empty description="No users found" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                            {u.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">
                              {u.full_name}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                (You)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Tag color={getRoleTagColor(u.role)} className="capitalize font-semibold rounded-md px-2 py-0.5">
                          {u.role}
                        </Tag>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Edit user role & details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {!isSelf && (
                            <Popconfirm
                              title="Delete User"
                              description={`Are you sure you want to permanently remove ${u.full_name}?`}
                              onConfirm={() => handleDeleteUser(u.id)}
                              okText="Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                            >
                              <button
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Popconfirm>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > size && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">
              Showing page {page} of {pages} ({total} total)
            </span>
            <Pagination
              size="small"
              current={page}
              total={total}
              pageSize={size}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage User Role & Details</h3>
              <p className="text-xs text-slate-500 font-normal">Update role and profile information</p>
            </div>
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="User full name"
              size="large"
              className="rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="user.email@e2m.com"
              size="large"
              className="rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign System Role</label>
            <Select
              value={editRole}
              onChange={(val) => setEditRole(val as UserRole)}
              className="w-full h-10 rounded-xl"
              options={[
                { value: UserRole.ADMIN, label: 'Admin (Full system access & deletion rights)' },
                { value: UserRole.MANAGER, label: 'Manager (Create/Edit customers, log meetings & AI insights)' },
                { value: UserRole.VIEWER, label: 'Viewer (Read-only access to dashboard and records)' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button onClick={() => setEditModalOpen(false)} className="rounded-xl" disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={actionLoading}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold"
            >
              Update User
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

