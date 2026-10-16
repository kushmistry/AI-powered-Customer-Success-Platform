'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { registerUser } from '@/lib/features/auth/authSlice';
import { Input, Button, Alert } from '@e2m/ui';
import { User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import GuestGuard from '@/components/guards/GuestGuard';

const registerValidationSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
});

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      full_name: '',
      email: '',
      password: '',
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      const result = await dispatch(registerUser(values));
      if (registerUser.fulfilled.match(result)) {
        toast.success('Account created successfully!');
        router.push('/');
      }
    },
  });

  return (
    <GuestGuard>
    <div className="flex min-h-screen bg-slate-50 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-200">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Create an Account
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Join the Customer Success Intelligence platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6">
              <Alert
                message="Registration Error"
                description={error}
                type="error"
                showIcon
                className="rounded-xl"
              />
            </div>
          )}

          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <Input
                size="large"
                name="full_name"
                prefix={<User className="h-4 w-4 text-slate-400 mr-1" />}
                placeholder="Jane Doe"
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                status={formik.touched.full_name && formik.errors.full_name ? 'error' : ''}
                className="rounded-xl"
              />
              {formik.touched.full_name && formik.errors.full_name && (
                <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email address <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <Input
                size="large"
                name="email"
                type="email"
                prefix={<Mail className="h-4 w-4 text-slate-400 mr-1" />}
                placeholder="jane@company.com"
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
                Password <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <Input.Password
                size="large"
                name="password"
                prefix={<Lock className="h-4 w-4 text-slate-400 mr-1" />}
                placeholder="Min. 8 chars with 1 uppercase & 1 number"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                status={formik.touched.password && formik.errors.password ? 'error' : ''}
                className="rounded-xl"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.password}</p>
              )}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="mt-6 w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
    </GuestGuard>
  );
}

