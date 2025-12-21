import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, type Order } from "../services/api";
import { Button } from "../components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

export function InvoiceView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchOrder();
    }, [id]);

    if (loading) return <div className="p-8"><Skeleton className="h-[400px] w-full" /></div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="min-h-screen bg-white text-black p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
            {/* No-print controls */}
            <div className="mb-8 flex justify-between print:hidden">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
            </div>

            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-8 mb-8">
                <div>
                    <div className="text-2xl font-bold tracking-tight text-slate-900">AIOMS</div>
                    <div className="text-sm text-slate-500 mt-1">Amino Acid Inventory & Order Management System</div>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-light text-slate-900 mb-2">INVOICE</h1>
                    <div className="text-sm font-medium text-slate-500">#{order.id}</div>
                    <div className="text-sm text-slate-500">{order.date}</div>
                </div>
            </div>

            {/* Bill To / From */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">From</h3>
                    <div className="text-sm leading-relaxed text-slate-700">
                        <strong className="text-slate-900">AIOMS Inc.</strong><br />
                        123 Tech Park Blvd<br />
                        Innovation City, CA 94043<br />
                        support@aioms.com
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Bill To</h3>
                    <div className="text-sm leading-relaxed text-slate-700">
                        <strong className="text-slate-900">{order.customer}</strong><br />
                        123 Science Park Drive<br />
                        Cambridge, MA 02142<br />
                        contact@client.com
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-12">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-2 font-semibold text-sm text-slate-900">Description</th>
                        <th className="text-right py-3 px-2 font-semibold text-sm text-slate-900">Quantity</th>
                        <th className="text-right py-3 px-2 font-semibold text-sm text-slate-900">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-slate-100">
                        <td className="py-4 px-2 text-sm text-slate-700">
                            <div className="font-medium text-slate-900">{order.product}</div>
                            <div className="text-xs text-slate-500">Chemical Substance</div>
                        </td>
                        <td className="py-4 px-2 text-right text-sm text-slate-700">{order.quantity}</td>
                        <td className="py-4 px-2 text-right text-sm text-slate-700">{order.amount}</td>
                    </tr>
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-2 text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span>{order.amount}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-slate-500">
                        <span>Tax (0%)</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold text-slate-900 border-t border-slate-200 mt-2 pt-2">
                        <span>Total</span>
                        <span>{order.amount}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
                <p>Thank you for your business. Please make payment within 30 days.</p>
            </div>
        </div>
    );
}
