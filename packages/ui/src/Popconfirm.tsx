'use client';

import React from 'react';
import { Popconfirm as AntPopconfirm, PopconfirmProps as AntPopconfirmProps } from 'antd';

export interface PopconfirmProps extends AntPopconfirmProps {
  children?: React.ReactNode;
}

export function Popconfirm({ okText = 'Yes', cancelText = 'Cancel', ...props }: PopconfirmProps) {
  return <AntPopconfirm okText={okText} cancelText={cancelText} {...props} />;
}

