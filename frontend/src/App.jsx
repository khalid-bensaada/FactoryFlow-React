import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Install from './pages/Install.jsx';
import Forbidden from './pages/Forbidden.jsx';
import NotFound from './pages/NotFound.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Materials from './pages/admin/Materials.jsx';
import MaterialDetail from './pages/admin/MaterialDetail.jsx';
import Products from './pages/admin/Products.jsx';
import Orders from './pages/admin/Orders.jsx';
import OrderForm from './pages/admin/OrderForm.jsx';
import Operators from './pages/admin/Operators.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import OperatorOrders from './pages/operator/OperatorOrders.jsx';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center">Chargement...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/operator'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/install" element={<Install />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forbidden" element={<Forbidden />} />

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="materials" element={<Materials />} />
          <Route path="materials/:id" element={<MaterialDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<OrderForm />} />
          <Route path="orders/:id/edit" element={<OrderForm />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="operators" element={<Operators />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['operator']} />}>
        <Route path="/operator" element={<Layout />}>
          <Route index element={<OperatorOrders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
