import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { mockCustomers, mockProducts } from "../lib/mockData";

export function CreateOrder() {
    const navigate = useNavigate();

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
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">Select a customer</option>
                            {mockCustomers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Product</label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">Select a product</option>
                            {mockProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.purity})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Quantity (kg)</label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Price per kg ($)</label>
                            <Input type="number" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => navigate("/orders")}>Cancel</Button>
                        <Button onClick={() => navigate("/orders")}>Create Order</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
