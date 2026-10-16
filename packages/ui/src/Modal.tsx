'use client';

import React from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';

export interface ModalProps extends AntModalProps {
  className?: string;
}

export function Modal({
  className = '',
  centered = true,
  destroyOnClose = true,
  ...props
}: ModalProps) {
  return (
    <AntModal
      centered={centered}
      destroyOnClose={destroyOnClose}
      className={`rounded-2xl ${className}`}
      {...props}
    />
  );
}

