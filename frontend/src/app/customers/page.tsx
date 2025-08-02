import { MainLayout } from '@/components/layout/MainLayout';
import { CustomerSearch } from '@/components/dashboard/CustomerSearch';

export default function Customers() {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
        <CustomerSearch />
      </div>
    </MainLayout>
  );
}