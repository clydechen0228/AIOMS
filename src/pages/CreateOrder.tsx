import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useEffect, useState } from "react";
import { api, type Customer, type Product } from "../services/api";

export function CreateOrder() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cData, pData] = await Promise.all([
                    api.getCustomers(),
                    api.getProducts()
                ]);
                setCustomers(cData);
                setProducts(pData);
            } catch (error) {
                console.error("Failed to fetch form data", error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!selectedCustomer || !selectedProduct || !quantity || !price) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await api.createOrder({
                customerId: selectedCustomer,
                productId: selectedProduct,
                quantity: Number(quantity),
                amount: Number(price) * Number(quantity),
                date: new Date().toISOString().split('T')[0]
            });
            navigate("/orders");
        } catch (error) {
            console.error("Failed to create order", error);
            alert("Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Customer</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                        >
                            <option value="">Select a customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Product</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">Select a product</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.purity})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Quantity (kg)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Price per kg ($)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => navigate("/orders")}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Creating..." : "Create Order"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
