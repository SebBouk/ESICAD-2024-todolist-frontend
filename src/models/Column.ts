export interface Column {
    label: string;
    key: string;
    isBoolean?: boolean;
    isDate?: boolean;
    isClickable?: boolean;
    isEditable?: boolean;
    options?: { value: string | number; label: string }[];
    activeLabel?: string;
    inactiveLabel?: string;
    formatter?: (row: any) => string;
  }