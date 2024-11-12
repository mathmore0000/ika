// Home.ts
import { DefaultProps } from './base';

export interface MaskInputNodeProps extends DefaultProps {
  placeholder?: string;
  label: string;
  setValue: (text: any, rawText:any) => void;
  value: any;
  mask: string;
  isInvalid?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
}