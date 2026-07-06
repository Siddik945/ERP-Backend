import { connectDB } from './config/db';
import { UserRole } from './constants/roles';
import { Customer } from './modules/customers/customer.model';
import { User } from './modules/users/user.model';

const runSeed = async () => {
  await connectDB();

  const users = [
    { name: 'Admin User', email: 'admin@erp.com', password: 'Admin@12345', role: UserRole.ADMIN },
    { name: 'Manager User', email: 'manager@erp.com', password: 'Manager@12345', role: UserRole.MANAGER },
    { name: 'Employee User', email: 'employee@erp.com', password: 'Employee@12345', role: UserRole.EMPLOYEE }
  ];

  for (const user of users) {
    const exists = await User.findOne({ email: user.email });
    if (!exists) await User.create(user);
  }

  const defaultCustomers = [
    { name: 'Walk-in Customer', phone: '0000000000', address: 'N/A' },
    { name: 'Retail Partner', email: 'partner@example.com', phone: '01700000000', address: 'Dhaka' }
  ];

  for (const customer of defaultCustomers) {
    const exists = await Customer.findOne({ name: customer.name });
    if (!exists) await Customer.create(customer);
  }

  console.log('Seed completed');
  process.exit(0);
};

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
