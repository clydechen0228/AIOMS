import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, CheckCircle, Truck, Package, Clock, Play } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { api, type Order } from "../services/api";
import { Skeleton } from "../components/ui/skeleton";

export function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            const data = await api.getOrderById(id);
            setOrder(data);
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async (status: string) => {
        if (!order) return;
        try {
            await api.updateOrderStatus(order.id, status);
            fetchOrder(); // Refresh to show new status
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-[200px]" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
                <Skeleton className="h-[300px] w-full" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h1 className="text-2xl font-bold">Order not found</h1>
                <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Order {order.id}</h1>
                        <p className="text-muted-foreground">{order.date} • {order.status}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {order.status === "Pending" && (
                        <Button onClick={() => handleStatusUpdate("Processing")}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Processing
                        </Button>
                    )}
                    {order.status === "Processing" && (
                        <Button onClick={() => handleStatusUpdate("Shipped")}>
                            <Truck className="mr-2 h-4 w-4" />
                            Ship Order
                        </Button>
                    )}
                    {order.status === "Shipped" && (
                        <Button onClick={() => handleStatusUpdate("Delivered")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Delivered
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate(`/orders/${order.id}/invoice`)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                </div>
            </div>

            {/* Order Status Visualization */}
            <div className="grid grid-cols-4 gap-4">
                <Card className={order.status === "Pending" ? "border-primary bg-primary/5" : ""}>
                    <CardHeader className="p-4 flex flex-row items-center gap-2 space-y-0">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Order Placed</CardTitle>
                    </CardHeader>
                </Card>
                <Card className={order.status === "Processing" ? "border-primary bg-primary/5" : ""}>
                    <CardHeader className="p-4 flex flex-row items-center gap-2 space-y-0">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Processing</CardTitle>
                    </CardHeader>
                </Card>
                <Card className={order.status === "Shipped" ? "border-primary bg-primary/5" : ""}>
                    <CardHeader className="p-4 flex flex-row items-center gap-2 space-y-0">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Shipped</CardTitle>
                    </CardHeader>
                </Card>
                <Card className={order.status === "Delivered" ? "border-primary bg-primary/5" : ""}>
                    <CardHeader className="p-4 flex flex-row items-center gap-2 space-y-0">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Customer Details */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>CAS No.</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Mock Line Item based on order data - In real app we would have order items table */}
                                <TableRow>
                                    <TableCell className="font-medium">{order.product}</TableCell>
                                    <TableCell>56-40-6</TableCell>
                                    <TableCell className="text-right">{order.quantity}</TableCell>
                                    <TableCell className="text-right"> - </TableCell> {/* Need price in generic order type */}
                                    <TableCell className="text-right">{order.amount}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div className="mt-6 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-8 text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{order.amount}</span>
                            </div>
                            <div className="flex items-center gap-8 text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex items-center gap-8 text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex items-center gap-8 font-bold text-lg mt-2">
                                <span>Total</span>
                                <span>{order.amount}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer & Payment Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                                    {order.customer.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium">{order.customer}</div>
                                    <div className="text-sm text-muted-foreground">Client ID: #CUST-{order.id}</div>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>123 Science Park Drive</p>
                                <p>Cambridge, MA 02142</p>
                                <p>United States</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 w-fit px-3 py-1 rounded-full text-sm">
                                <CheckCircle className="h-4 w-4" />
                                Paid
                            </div>
                            <div className="mt-4 text-sm text-muted-foreground">
                                <p>Visa ending in 4242</p>
                                <p>Paid on {order.date}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
