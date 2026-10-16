'use client';

import React from 'react';
import { Select as AntSelect, SelectProps as AntSelectProps } from 'antd';

export interface SelectProps<T = any> extends AntSelectProps<T> {
  className?: string;
}

export function Select<T = any>({ className = '', ...props }: SelectProps<T>) {
  return (
    <AntSelect
      className={`rounded-xl ${className}`}
      {...props}
    />
  );
}

