import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';

import { CreateOrder } from './pages/CreateOrder';
import { Products } from './pages/Products';
import { ProductForm } from './pages/ProductForm';
import { Customers } from './pages/Customers';

import { InvoiceView } from './pages/InvoiceView';

import { ToasterProvider } from './components/ui/SimpleToast';

function App() {
    return (
        <ToasterProvider>
            <Router>
                <Routes>
                    <Route path="/orders/:id/invoice" element={<InvoiceView />} />
                    <Route element={<DashboardLayout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/new" element={<CreateOrder />} />
                        <Route path="/orders/:id" element={<OrderDetails />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/new" element={<ProductForm />} />
                        <Route path="/customers" element={<Customers />} />
                    </Route>
                </Routes>
            </Router>
        </ToasterProvider>
    );
}

export default App;
