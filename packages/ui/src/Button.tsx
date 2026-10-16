'use client';

import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends AntButtonProps {
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', type = 'default', children, ...props }, ref) => {
    let customClass = className;
    if (type === 'primary') {
      customClass = `rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-xs ${className}`;
    } else if (type === 'default') {
      customClass = `rounded-xl border-slate-200 hover:border-indigo-400 font-semibold shadow-xs ${className}`;
    } else {
      customClass = `rounded-xl ${className}`;
    }

    return (
      <AntButton ref={ref} type={type} className={customClass} {...props}>
        {children}
      </AntButton>
    );
  }
);

Button.displayName = 'Button';

