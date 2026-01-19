/**
 * Props para el componente Select genérico
 */
export type SelectComponentProps<T extends object> = {
  data: T[];
  keyProperty: keyof T;
  primaryTextKey: keyof T;
  secondaryTextKey?: keyof T;
  label?: string;
  placeholder?: string;
  className?: string;
  onSelectionChange?: (key: string | number) => void;
};
