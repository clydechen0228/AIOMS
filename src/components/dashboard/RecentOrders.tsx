import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { api, type Order } from "../../services/api";
import { Skeleton } from "../ui/skeleton";

// Simple Badge implementation inline for now
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

export function RecentOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.getOrders();
                // Show only latest 5
                setOrders(data.slice(0, 5));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
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
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>{order.product}</TableCell>
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
    );
}
