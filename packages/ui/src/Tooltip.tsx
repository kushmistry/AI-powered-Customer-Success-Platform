'use client';

import React from 'react';
import { Tooltip as AntTooltip, TooltipProps as AntTooltipProps } from 'antd';

export interface TooltipProps extends AntTooltipProps {}

export function Tooltip(props: TooltipProps) {
  return <AntTooltip {...props} />;
}

