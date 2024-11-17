// Home.ts
import { DefaultProps } from './base';

export interface InputButtonNodeProps extends DefaultProps {
  placeholder?: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  value: any;
  isInvalid?: boolean;
}