'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { loginUser, clearAuthError } from '@/lib/features/auth/authSlice';
import { Input, Button, Alert } from '@e2m/ui';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import GuestGuard from '@/components/guards/GuestGuard';

const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      const result = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(result)) {
        toast.success('Welcome back!');
        router.push('/');
      }
    },
  });

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    formik.setValues({
      email: demoEmail,
      password: demoPass,
    });
    dispatch(clearAuthError());
  };

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
          Customer Success Platform
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Sign in to access your customer intelligence dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6">
              <Alert
                message="Authentication Failed"
                description={error}
                type="error"
                showIcon
                className="rounded-xl"
              />
            </div>
          )}

          <form className="space-y-5" onSubmit={formik.handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email address <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <Input
                size="large"
                name="email"
                type="email"
                prefix={<Mail className="h-4 w-4 text-slate-400 mr-1" />}
                placeholder="you@company.com"
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
                placeholder="••••••••"
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
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
            >
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Demo Credentials Quick Fill */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-medium text-slate-500 mb-2.5 text-center">
              Quick Sign In with Demo Accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@e2m.com', 'Admin123!')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-center"
              >
                <div className="font-semibold">Admin</div>
                <div className="text-[10px] text-slate-400">Full Access</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('manager@e2m.com', 'Manager123!')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-center"
              >
                <div className="font-semibold">Manager</div>
                <div className="text-[10px] text-slate-400">CRUD + AI</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('viewer@e2m.com', 'Viewer123!')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-center"
              >
                <div className="font-semibold">Viewer</div>
                <div className="text-[10px] text-slate-400">Read-Only</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
    </GuestGuard>
  );
}

