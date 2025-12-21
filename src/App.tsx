import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';

import { CreateOrder } from './pages/CreateOrder';
import { Products } from './pages/Products';
import { ProductForm } from './pages/ProductForm';
import { Customers } from './pages/Customers';

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/new" element={<CreateOrder />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/new" element={<ProductForm />} />
                    <Route path="/customers" element={<div className="p-4">Customers Content Placeholder</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
