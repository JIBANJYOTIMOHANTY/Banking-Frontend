export interface TableButton {
  label: string | ((row: any) => string);
  icon?: string | ((row: any) => string);
  actionName: string;
  class?: string;
}

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'mono' | 'badge' | 'icon-text' | 'status-text' | 'currency' | 'transaction-amount' | 'transaction-type-badge' | 'customer-profile' | 'badge-mono' | 'actions';
  align?: 'left' | 'right' | 'center';
  prefix?: string;
  iconKey?: string; // key of the icon field for 'icon-text' columns
  statusKey?: string; // key of the status field to style 'status-text' columns
  buttons?: TableButton[];
}
