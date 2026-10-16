'use client';

import React from 'react';
import { Alert as AntAlert, AlertProps as AntAlertProps } from 'antd';

export interface AlertProps extends AntAlertProps {
  className?: string;
}

export function Alert({ className = '', showIcon = true, ...props }: AlertProps) {
  return <AntAlert showIcon={showIcon} className={`rounded-xl ${className}`} {...props} />;
}

