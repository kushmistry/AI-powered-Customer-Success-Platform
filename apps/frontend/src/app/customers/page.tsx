'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  setCustomerFilters,
} from '@/lib/features/customers/customerSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomerModal from '@/components/customers/CustomerModal';
import { Customer } from '@/types';
import { formatDate } from '@/lib/utils';
import { Popconfirm, Button, Input, Select, Tag, Pagination, Spin, Empty } from '@e2m/ui';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';

function CustomersContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { list, total, page, size, pages, loading, actionLoading, filters } = useAppSelector(
    (state) => state.customers
  );
  const { user } = useAppSelector((state) => state.auth);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  useEffect(() => {
    if (searchParams.get('action') === 'new' && canEdit) {
      setSelectedCustomer(null);
      setModalOpen(true);
    }
  }, [searchParams, canEdit]);

  useEffect(() => {
    dispatch(fetchCustomers(filters));
  }, [dispatch, filters]);

  // Debounce customer search on onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchTerm.trim();
      const current = filters.search || '';
      if (trimmed !== current) {
        dispatch(setCustomerFilters({ search: trimmed || undefined, page: 1 }));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, filters.search]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchTerm.trim();
    const current = filters.search || '';
    if (trimmed !== current) {
      dispatch(setCustomerFilters({ search: trimmed || undefined, page: 1 }));
    }
  };

  const handleStatusFilter = (status: string) => {
    dispatch(
      setCustomerFilters({
        status: status === 'all' ? undefined : (status as any),
        page: 1,
      })
    );
  };

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleSaveCustomer = async (data: Partial<Customer>) => {
    try {
      if (selectedCustomer) {
        const res = await dispatch(updateCustomer({ id: selectedCustomer.id, data }));
        if (updateCustomer.fulfilled.match(res)) {
          toast.success('Customer updated successfully');
          setModalOpen(false);
        } else {
          toast.error(res.payload || 'Failed to update customer');
        }
      } else {
        const res = await dispatch(createCustomer(data));
        if (createCustomer.fulfilled.match(res)) {
          toast.success('Customer created successfully');
          setModalOpen(false);
        } else {
          toast.error(res.payload || 'Failed to create customer');
        }
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await dispatch(deleteCustomer(id));
    if (deleteCustomer.fulfilled.match(res)) {
      toast.success('Customer deleted');
    } else {
      toast.error(res.payload || 'Failed to delete customer');
    }
  };

  const getStatusTagColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'churned':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout title="Customer Directory">
      {/* Top action header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Customers ({total})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your customer portfolio, contacts, and account health
          </p>
        </div>

        {canEdit && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={handleOpenCreate}
            size="middle"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-xs flex items-center gap-1"
          >
            Add Customer
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={() => handleSearch()}
            placeholder="Search by company name, contact, or email..."
            prefix={<Search className="h-4 w-4 text-slate-400 mr-1" />}
            allowClear
            size="middle"
            className="rounded-xl"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select
            value={filters.status || 'all'}
            onChange={handleStatusFilter}
            size="middle"
            className="w-36"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' },
              { value: 'churned', label: 'Churned Only' },
            ]}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center">
            <Empty
              description={
                <span className="text-xs text-slate-500">
                  {filters.search || filters.status
                    ? 'Try adjusting your search criteria or clear filters.'
                    : 'Get started by creating your first customer account.'}
                </span>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Company & Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {list.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/customers/${cust.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 block"
                      >
                        {cust.company}
                      </Link>
                      <span className="text-slate-500 text-[11px]">{cust.name}</span>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{cust.email}</span>
                      </div>
                      {cust.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{cust.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Tag color={getStatusTagColor(cust.status)} className="capitalize font-semibold rounded-md">
                        {cust.status}
                      </Tag>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {formatDate(cust.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/customers/${cust.id}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                          title="View customer details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(cust)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Edit customer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {canDelete && (
                              <Popconfirm
                                title="Delete Customer"
                                description={`Are you sure you want to delete ${cust.company}? All related interactions will also be deleted.`}
                                onConfirm={() => handleDelete(cust.id)}
                                okText="Delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                              >
                                <button
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                                  title="Delete customer (Admin only)"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </Popconfirm>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > (size || 10) && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">
              Showing page {page} of {pages} ({total} total)
            </span>
            <Pagination
              size="small"
              current={page}
              total={total}
              pageSize={size || 10}
              onChange={(p) => dispatch(setCustomerFilters({ page: p }))}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveCustomer}
        customer={selectedCustomer}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        </DashboardLayout>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}
