'use client';

import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Customer, InteractionType } from '@/types';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { fetchCustomers } from '@/lib/features/customers/customerSlice';
import { Modal, Select, Input, Switch, Button, DatePicker } from '@e2m/ui';
import dayjs from 'dayjs';
import { MessageSquare, Sparkles as SparklesLucide } from 'lucide-react';

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  preselectedCustomerId?: string;
  loading?: boolean;
}

const interactionValidationSchema = Yup.object().shape({
  customer_id: Yup.string().required('Please select a customer account'),
  type: Yup.string().oneOf(['meeting', 'call', 'email']).required('Interaction type is required'),
  subject: Yup.string()
    .min(2, 'Subject must be at least 2 characters')
    .max(255, 'Subject cannot exceed 255 characters')
    .required('Subject is required'),
  notes: Yup.string()
    .min(5, 'Notes must be at least 5 characters')
    .max(10000, 'Notes cannot exceed 10,000 characters')
    .required('Meeting notes are required'),
  interaction_date: Yup.string()
    .required('Date & time is required')
    .test('no-future-date', 'Interaction date cannot be in the future', (val) => {
      if (!val) return true;
      return dayjs(val).isBefore(dayjs().add(1, 'minute'));
    }),
  auto_generate_insights: Yup.boolean().default(true),
});

export default function InteractionModal({
  isOpen,
  onClose,
  onSubmit,
  preselectedCustomerId,
  loading = false,
}: InteractionModalProps) {
  const dispatch = useAppDispatch();
  const { list: customers } = useAppSelector((state) => state.customers);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCustomers({ size: 100 }));
    }
  }, [isOpen, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customer_id: preselectedCustomerId || '',
      type: 'meeting',
      subject: '',
      notes: '',
      interaction_date: new Date().toISOString().substring(0, 16),
      auto_generate_insights: true,
    },
    validationSchema: interactionValidationSchema,
    onSubmit: async (values) => {
      await onSubmit({
        customer_id: values.customer_id,
        type: values.type,
        subject: values.subject,
        notes: values.notes,
        interaction_date: new Date(values.interaction_date).toISOString(),
        auto_generate_insights: values.auto_generate_insights,
      });
      formik.resetForm();
    },
  });

  const handleModalClose = () => {
    formik.resetForm();
    onClose();
  };

  // Disable future dates in calendar
  const disabledDate = (current: any) => {
    return current && current > dayjs().endOf('day');
  };

  // Disable future hours/minutes if selected date is today
  const disabledDateTime = (current: any) => {
    if (!current || !dayjs(current).isSame(dayjs(), 'day')) {
      return {};
    }
    const now = dayjs();
    const currentHour = now.hour();
    const currentMinute = now.minute();
    return {
      disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h > currentHour),
      disabledMinutes: (selectedHour: number) => {
        if (selectedHour === currentHour) {
          return Array.from({ length: 60 }, (_, i) => i).filter((m) => m > currentMinute);
        }
        if (selectedHour > currentHour) {
          return Array.from({ length: 60 }, (_, i) => i);
        }
        return [];
      },
    };
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleModalClose}
      title={
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-base font-bold text-slate-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span>Record Customer Interaction</span>
        </div>
      }
      footer={null}
      destroyOnClose
      centered
      width={560}
      className="rounded-2xl"
    >
      <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Customer Account <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <Select
            size="large"
            className="w-full"
            placeholder="Select a customer..."
            value={formik.values.customer_id || undefined}
            onChange={(val) => formik.setFieldValue('customer_id', val)}
            status={formik.touched.customer_id && formik.errors.customer_id ? 'error' : ''}
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.company} (${c.name})`,
            }))}
          />
          {formik.touched.customer_id && formik.errors.customer_id && (
            <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.customer_id}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Interaction Type <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <Select
              size="large"
              className="w-full"
              value={formik.values.type}
              onChange={(val) => formik.setFieldValue('type', val)}
              options={[
                { value: 'meeting', label: '🤝 Meeting' },
                { value: 'call', label: '📞 Phone Call' },
                { value: 'email', label: '✉️ Email' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Date & Time <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              size="large"
              className="w-full rounded-xl"
              disabledDate={disabledDate}
              disabledTime={disabledDateTime}
              value={formik.values.interaction_date ? dayjs(formik.values.interaction_date) : null}
              onChange={(date) => {
                if (date && !Array.isArray(date)) {
                  formik.setFieldValue('interaction_date', date.toISOString());
                } else {
                  formik.setFieldValue('interaction_date', '');
                }
              }}
              status={formik.touched.interaction_date && formik.errors.interaction_date ? 'error' : ''}
            />
            {formik.touched.interaction_date && formik.errors.interaction_date && (
              <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.interaction_date}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Subject / Topic <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <Input
            size="large"
            name="subject"
            placeholder="e.g. Q4 Executive Business Review & Expansion"
            value={formik.values.subject}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            status={formik.touched.subject && formik.errors.subject ? 'error' : ''}
            className="rounded-xl"
          />
          {formik.touched.subject && formik.errors.subject && (
            <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.subject}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Meeting Notes & Discussion <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <Input.TextArea
            rows={5}
            name="notes"
            placeholder="Paste or write detailed notes from the conversation. The AI will extract sentiment, action items, and risks automatically..."
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            status={formik.touched.notes && formik.errors.notes ? 'error' : ''}
            className="rounded-xl leading-relaxed text-xs"
          />
          {formik.touched.notes && formik.errors.notes && (
            <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.notes}</p>
          )}
        </div>

        {/* AI Generation Switch */}
        <div className="flex items-center justify-between rounded-xl bg-indigo-50/70 p-3 border border-indigo-100">
          <div className="flex items-center gap-2">
            <SparklesLucide className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-medium text-indigo-900">
              Auto-generate AI Insights with Google Gemini
            </span>
          </div>
          <Switch
            checked={formik.values.auto_generate_insights}
            onChange={(checked) => formik.setFieldValue('auto_generate_insights', checked)}
            className="bg-slate-300"
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
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold flex items-center gap-1.5"
          >
            <SparklesLucide className="h-3.5 w-3.5" />
            <span>{loading ? 'Analyzing & Saving...' : 'Save & Analyze'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

