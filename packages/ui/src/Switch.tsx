'use client';

import React from 'react';
import { Switch as AntSwitch, SwitchProps as AntSwitchProps } from 'antd';

export interface SwitchProps extends AntSwitchProps {
  className?: string;
}

export function Switch({ className = '', ...props }: SwitchProps) {
  return <AntSwitch className={className} {...props} />;
}

