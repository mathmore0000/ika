// Home.ts
import { DefaultProps } from './base';

export interface DropdownNodeProps extends DefaultProps {
  data: { label: string, value: any }[];
  placeholder?: string;
  label: string;
  setValue: (value: any) => void;
  value: any;
  disabled?: boolean;
  isInvalid?: boolean;
  search?: boolean;
}