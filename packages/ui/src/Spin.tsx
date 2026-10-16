'use client';

import React from 'react';
import { Spin as AntSpin, SpinProps as AntSpinProps } from 'antd';

export interface SpinProps extends AntSpinProps {
  fullHeight?: boolean;
}

export function Spin({ fullHeight = false, ...props }: SpinProps) {
  if (fullHeight) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <AntSpin {...props} />
      </div>
    );
  }
  return <AntSpin {...props} />;
}

