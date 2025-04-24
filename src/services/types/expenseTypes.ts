
export type ExpenseDB = {
  id: number;
  date: string;
  category: string;
  description: string;
  value: number;
  status: string;
  paymentType?: string;
  installment?: number;
  totalInstallments?: number;
  userId?: string;
};

export const mockExpenses: ExpenseDB[] = [
  {
    id: 1,
    date: '2023-04-15',
    category: 'Alimentação',
    description: 'Almoço de negócios',
    value: 120.50,
    status: 'Pago',
    paymentType: 'À Vista'
  },
  {
    id: 2,
    date: '2023-04-18',
    category: 'Transporte',
    description: 'Gasolina',
    value: 200.00,
    status: 'Pendente',
    paymentType: 'À Vista'
  }
];
