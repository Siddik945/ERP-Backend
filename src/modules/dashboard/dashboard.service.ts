import { Customer } from '../customers/customer.model';
import { Product } from '../products/product.model';
import { Sale } from '../sales/sale.model';

const getDashboardStats = async () => {
  const [totalProducts, totalCustomers, totalSales, lowStockProducts] = await Promise.all([
    Product.countDocuments(),
    Customer.countDocuments(),
    Sale.countDocuments(),
    Product.find({ stockQuantity: { $lt: 5 } }).sort({ stockQuantity: 1 }).limit(20)
  ]);

  return {
    totalProducts,
    totalCustomers,
    totalSales,
    lowStockProducts
  };
};

export const DashboardService = { getDashboardStats };
