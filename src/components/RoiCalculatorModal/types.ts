import { InputHTMLAttributes, ReactNode, ReactText } from "react";

export const scales = {
  SM: "sm",
  MD: "md",
  LG: "lg",
} as const;

export type Scales = typeof scales[keyof typeof scales];
export interface InputProps {
  scale?: Scales;
  isSuccess?: boolean;
  isWarning?: boolean;
}

export interface BalanceInputProps {
  value: ReactText;
  onFocus: any;
  onUserInput: (input: string) => void;
  currencyValue?: ReactNode;
  placeholder?: string;
  inputProps?: any;
  isWarning?: boolean;
  decimals?: number;
  unit?: string;
  switchEditingUnits?: () => void;
}

export interface TextfieldProps {
  label: ReactNode;
  value: ReactText;
  placeholder?: string;
  onUserInput: (input: string) => void;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "placeholder" | "onChange">;
  isWarning?: boolean;
}
