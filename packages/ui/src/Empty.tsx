'use client';

import React from 'react';
import { Empty as AntEmpty, EmptyProps as AntEmptyProps } from 'antd';

export interface EmptyProps extends AntEmptyProps {}

export function Empty(props: EmptyProps) {
  return <AntEmpty {...props} />;
}

