import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { api, type Order } from "../services/api";
import { Skeleton } from "../components/ui/skeleton";

function StatusBadge({ status }: { status: string }) {
    let colorClass = "bg-gray-100 text-gray-800";
    if (status === "Pending") colorClass = "bg-yellow-100 text-yellow-800";
    else if (status === "Shipped") colorClass = "bg-blue-100 text-blue-800";
    else if (status === "Delivered") colorClass = "bg-green-100 text-green-800";
    else if (status === "Processing") colorClass = "bg-purple-100 text-purple-800";

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {status}
        </span>
    );
}

export function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <div className="flex gap-2">
                    <Button variant="outline">Export</Button>
                    <Button onClick={() => navigate("/orders/new")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Order
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Orders</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search orders..."
                                    className="pl-8 w-[250px]"
                                />
                            </div>
                            <Button variant="outline" size="sm" className="h-9">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            <Link to={`/orders/${order.id}`} className="text-primary hover:underline">
                                                {order.id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell>{order.product}</TableCell>
                                        <TableCell>{order.quantity}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={order.status} />
                                        </TableCell>
                                        <TableCell className="text-right">{order.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
