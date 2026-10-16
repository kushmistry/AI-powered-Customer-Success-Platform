'use client';

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Customer, CustomerStatus } from '@/types';
import { Modal, Input, Select, Button } from '@e2m/ui';
import { User, Mail, Building2, Phone } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Customer>) => Promise<void>;
  customer?: Customer | null;
  loading?: boolean;
}

const customerValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  company: Yup.string()
    .min(2, 'Company must be at least 2 characters')
    .max(200, 'Company must be under 200 characters')
    .required('Company name is required'),
  phone: Yup.string().nullable(),
  status: Yup.string()
    .oneOf(['active', 'inactive', 'churned'], 'Invalid status')
    .required('Status is required'),
});

export default function CustomerModal({
  isOpen,
  onClose,
  onSubmit,
  customer,
  loading = false,
}: CustomerModalProps) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      company: customer?.company || '',
      phone: customer?.phone || '',
      status: (customer?.status as CustomerStatus) || CustomerStatus.ACTIVE,
    },
    validationSchema: customerValidationSchema,
    onSubmit: async (values) => {
      await onSubmit({
        name: values.name,
        email: values.email,
        company: values.company,
        phone: values.phone ? values.phone : null,
        status: values.status,
      });
      formik.resetForm();
    },
  });

  const handleModalClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleModalClose}
      title={
        <div className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
          {customer ? 'Edit Customer' : 'Add New Customer'}
        </div>
      }
      footer={null}
      destroyOnClose
      centered
      className="rounded-2xl"
    >
      <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Full Name <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <Input
            size="large"
            name="name"
            prefix={<User className="h-4 w-4 text-slate-400 mr-1" />}
            placeholder="John Smith"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            status={formik.touched.name && formik.errors.name ? 'error' : ''}
            className="rounded-xl"
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <Input
            size="large"
            name="email"
            type="email"
            prefix={<Mail className="h-4 w-4 text-slate-400 mr-1" />}
            placeholder="john@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            status={formik.touched.email && formik.errors.email ? 'error' : ''}
            className="rounded-xl"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Company <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <Input
            size="large"
            name="company"
            prefix={<Building2 className="h-4 w-4 text-slate-400 mr-1" />}
            placeholder="Acme Corp"
            value={formik.values.company}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            status={formik.touched.company && formik.errors.company ? 'error' : ''}
            className="rounded-xl"
          />
          {formik.touched.company && formik.errors.company && (
            <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.company}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Phone Number
          </label>
          <Input
            size="large"
            name="phone"
            prefix={<Phone className="h-4 w-4 text-slate-400 mr-1" />}
            placeholder="+1 (555) 012-3456"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Account Status
          </label>
          <Select
            size="large"
            className="w-full"
            value={formik.values.status}
            onChange={(val) => formik.setFieldValue('status', val)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'churned', label: 'Churned' },
            ]}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button onClick={handleModalClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold"
          >
            {customer ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

