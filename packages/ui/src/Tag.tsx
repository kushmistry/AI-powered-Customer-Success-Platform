'use client';

import React from 'react';
import { Tag as AntTag, TagProps as AntTagProps } from 'antd';

export interface TagProps extends AntTagProps {
  className?: string;
}

export function Tag({ className = '', ...props }: TagProps) {
  return <AntTag className={`font-semibold rounded-md ${className}`} {...props} />;
}

