// app/admin/layout.jsx - Layout wrapper para todas las páginas admin
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminLayoutWrapper({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}