'use client';

import React from 'react';
import {
  Input as AntInput,
  InputProps as AntInputProps,
  InputRef,
} from 'antd';
import type { TextAreaProps as AntTextAreaProps } from 'antd/es/input';
import type { PasswordProps as AntPasswordProps } from 'antd/es/input/Password';
import type { SearchProps as AntSearchProps } from 'antd/es/input/Search';

export interface InputProps extends AntInputProps {
  className?: string;
}

export interface TextAreaProps extends AntTextAreaProps {
  className?: string;
}

export interface PasswordProps extends AntPasswordProps {
  className?: string;
}

export interface SearchProps extends AntSearchProps {
  className?: string;
}

const InputComponent = React.forwardRef<InputRef, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <AntInput
        ref={ref}
        className={`rounded-xl ${className}`}
        {...props}
      />
    );
  }
);
InputComponent.displayName = 'Input';

const PasswordComponent = React.forwardRef<InputRef, PasswordProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <AntInput.Password
        ref={ref}
        className={`rounded-xl ${className}`}
        {...props}
      />
    );
  }
);
PasswordComponent.displayName = 'Input.Password';

const TextAreaComponent = React.forwardRef<any, TextAreaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <AntInput.TextArea
        ref={ref}
        className={`rounded-xl ${className}`}
        {...props}
      />
    );
  }
);
TextAreaComponent.displayName = 'Input.TextArea';

const SearchComponent = React.forwardRef<InputRef, SearchProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <AntInput.Search
        ref={ref}
        className={`rounded-xl ${className}`}
        {...props}
      />
    );
  }
);
SearchComponent.displayName = 'Input.Search';

export const Input = Object.assign(InputComponent, {
  Password: PasswordComponent,
  TextArea: TextAreaComponent,
  Search: SearchComponent,
});

