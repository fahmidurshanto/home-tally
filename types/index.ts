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
  // NOTE: `types` is NOT returned by GET /expenses (API 8). It is only SENT on
  // create/update (APIs 9/10). For display, resolve the type via the category:
  // `lib/utils.ts` -> resolveExpenseType(expense, categories).
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
  // Mutation responses return one of these ID fields instead of `data`.
  NewID?: number | string;
  UpdateID?: number | string;
  RowID?: number | string;
  new_id?: number | string;
}
