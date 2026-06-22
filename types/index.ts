export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  company: string;
  organiz: string;
  status: string;
  type: string;
}

export interface Category {
  id: string;
  name: string;
  status: string;
  types: string;
  company: string;
}

export interface Expense {
  id: string;
  company_id: string;
  category_id: string;
  user_id: string;
  particular: string;
  date: string;
  amount: string;
  types?: string;
  created_on: string;
  updated_on: string;
  category: string;
}

export interface ApiResponse<T = any> {
  error: string;
  code: string;
  message: string;
  data?: T;
}
