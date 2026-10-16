'use client';

import React from 'react';
import { Pagination as AntPagination, PaginationProps as AntPaginationProps } from 'antd';

export interface PaginationProps extends AntPaginationProps {
  className?: string;
}

export function Pagination({
  className = '',
  size = 'small',
  showSizeChanger = false,
  ...props
}: PaginationProps) {
  return (
    <AntPagination
      size={size}
      showSizeChanger={showSizeChanger}
      className={className}
      {...props}
    />
  );
}

