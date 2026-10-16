'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store';
import { updateProfile } from '@/lib/features/auth/authSlice';
import { Modal, Input, Button, Tag } from '@e2m/ui';
import { User, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Name and email cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const result = await dispatch(updateProfile({ full_name: fullName.trim(), email: email.trim() }));
      if (updateProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully!');
        onClose();
      } else {
        toast.error((result.payload as string) || 'Failed to update profile');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'manager':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">User Profile</h3>
            <p className="text-xs text-slate-500 font-normal">Manage your account information</p>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Role badge display */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-medium text-slate-600">System Role</span>
          </div>
          <Tag color={getRoleColor(user?.role)} className="capitalize font-semibold rounded-md px-2.5 py-0.5">
            {user?.role || 'User'}
          </Tag>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            prefix={<User className="h-4 w-4 text-slate-400 mr-1" />}
            size="large"
            className="rounded-xl"
            required
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@e2m.com"
            prefix={<Mail className="h-4 w-4 text-slate-400 mr-1" />}
            size="large"
            className="rounded-xl"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button onClick={onClose} className="rounded-xl" disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

