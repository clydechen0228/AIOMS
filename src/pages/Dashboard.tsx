import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { MetricCard } from "../components/dashboard/MetricCard";
import { RecentOrders } from "../components/dashboard/RecentOrders";
import { api, type Metrics } from "../services/api";
import { Skeleton } from "../components/ui/skeleton";

export function Dashboard() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getMetrics();
                setMetrics(data);
            } catch (error) {
                console.error("Failed to fetch metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="col-span-3 h-[300px] w-full rounded-xl" />
                    <Skeleton className="col-span-4 h-[300px] w-full rounded-xl" />
                </div>
            </div>
        )
    }

    if (!metrics) {
        return (
            <div className="flex flex-col gap-6 p-8 text-center">
                <h2 className="text-xl font-semibold text-red-600">Failed to load dashboard data</h2>
                <p className="text-muted-foreground">Please ensure the backend server is running.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Revenue"
                    value={metrics.totalRevenue}
                    description="Total revenue for the fiscal year"
                    icon={DollarSign}
                    trend="+20.1% from last month"
                />
                <MetricCard
                    title="Active Orders"
                    value={metrics.activeOrders}
                    description="Orders currently being processed"
                    icon={ShoppingBag}
                />
                <MetricCard
                    title="Products in Stock"
                    value={metrics.productsInStock}
                    description="Unique items in inventory"
                    icon={Package}
                />
                <MetricCard
                    title="Active Customers"
                    value={metrics.newCustomers} // Using newCustomers string for now as mocked
                    description="Customers with recent activity"
                    icon={Users}
                    trend="+12% new this month"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RecentOrders />
                {/* Placeholder for Sales Chart - would take up col-span-4 */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">Overview</h3>
                    <div className="h-[300px] flex items-center justify-center border-dashed border-2 rounded-lg bg-muted/20">
                        <span className="text-muted-foreground">Sales Chart Visualization (Requires Recharts)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
