'use client';

import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps as AntDatePickerProps } from 'antd';
import type { RangePickerProps as AntRangePickerProps } from 'antd/es/date-picker';

export type DatePickerProps = AntDatePickerProps;
export type RangePickerProps = AntRangePickerProps;

export interface CompoundedDatePicker
  extends React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<any>> {
  RangePicker: React.ForwardRefExoticComponent<RangePickerProps & React.RefAttributes<any>>;
}

const DatePickerComponent = React.forwardRef<any, DatePickerProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <AntDatePicker
        ref={ref}
        className={`rounded-xl ${className}`}
        {...props}
      />
    );
  }
);
DatePickerComponent.displayName = 'DatePicker';

const RangePickerComponent = React.forwardRef<any, RangePickerProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <AntDatePicker.RangePicker
        ref={ref}
        className={`rounded-xl ${className}`}
        {...props}
      />
    );
  }
);
RangePickerComponent.displayName = 'DatePicker.RangePicker';

export const DatePicker: CompoundedDatePicker = Object.assign(DatePickerComponent, {
  RangePicker: RangePickerComponent,
});

