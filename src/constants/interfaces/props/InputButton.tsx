// Home.ts
import { DefaultProps } from './base';

export interface InputButtonNodeProps extends DefaultProps {
  placeholder?: string;
  label: string;
  action: () => void;
  value: any;
  isInvalid?: boolean;
}