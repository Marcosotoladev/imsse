// app/cliente/layout.jsx - Layout automático para todas las rutas de cliente
import ClienteLayout from '../components/cliente/ClienteLayout';

export default function ClienteLayoutWrapper({ children }) {
  return <ClienteLayout>{children}</ClienteLayout>;
}