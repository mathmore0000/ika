// Home.ts
import { DefaultProps } from './base';

export interface TextInputNodeProps extends DefaultProps {
  placeholder?: string;
  label: string;
  setValue: (value: any) => void;
  value: any;
  isInvalid?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
}