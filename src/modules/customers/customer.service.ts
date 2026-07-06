import { ApiError } from '../../utils/ApiError';
import { QueryBuilder } from '../../utils/queryBuilder';
import { ICustomer } from './customer.interface';
import { Customer } from './customer.model';

const createCustomer = async (payload: Partial<ICustomer>) => {
  return Customer.create(payload);
};

const getCustomers = async (query: Record<string, unknown>) => {
  return new QueryBuilder(Customer, query, ['name', 'email', 'phone'])
    .search()
    .sort()
    .paginate()
    .execute();
};

const getCustomerById = async (id: string) => {
  const customer = await Customer.findById(id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  return customer;
};

const updateCustomer = async (id: string, payload: Partial<ICustomer>) => {
  const customer = await Customer.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!customer) throw new ApiError(404, 'Customer not found');
  return customer;
};

const deleteCustomer = async (id: string) => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  return customer;
};

export const CustomerService = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer };
