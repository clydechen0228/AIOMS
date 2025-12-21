import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState, useMemo } from "react";
import { api } from "../../services/api";
import { Skeleton } from "../ui/skeleton";

interface SalesData {
    date: string;
    total: number;
}

export function SalesChart() {
    const [data, setData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredValue, setHoveredValue] = useState<SalesData | null>(null);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const salesData = await api.getSalesData();
                setData(salesData);
            } catch (error) {
                console.error("Failed to fetch sales data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    const { points, areaPath, linePath, maxValue } = useMemo(() => {
        if (data.length === 0) return { points: [], areaPath: "", linePath: "", maxValue: 0 };

        const vals = data.map(d => d.total);
        const max = Math.max(...vals, 1); // Avoid div by zero
        const width = 1000; // API internal width
        const height = 300;
        const padding = 20;
        const graphHeight = height - padding * 2;

        const pts = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - padding - (d.total / max) * graphHeight;
            return { x, y, data: d };
        });

        const lineCmd = pts.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
        const areaCmd = `${lineCmd} L ${width},${height} L 0,${height} Z`;

        return { points: pts, areaPath: areaCmd, linePath: lineCmd, maxValue: max };
    }, [data]);

    if (loading) return <Skeleton className="h-[350px] w-full rounded-xl" />;

    return (
        <Card className="col-span-4 transition-all hover:shadow-md">
            <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="relative h-[300px] w-full overflow-hidden">
                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground p-2 pointer-events-none">
                        <span>${maxValue.toFixed(0)}</span>
                        <span>${(maxValue / 2).toFixed(0)}</span>
                        <span>$0</span>
                    </div>

                    <svg viewBox="0 0 1000 300" className="h-full w-full preserve-3d" style={{ overflow: "visible" }}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#adfa1d" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#adfa1d" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {/* Area */}
                        <path d={areaPath} fill="url(#chartGradient)" />
                        {/* Line */}
                        <path d={linePath} fill="none" stroke="#adfa1d" strokeWidth="3" />

                        {/* Interactive Points */}
                        {points.map((p, i) => (
                            <circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                className="fill-background stroke-[#adfa1d] stroke-2 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                onMouseEnter={() => setHoveredValue(p.data)}
                                onMouseLeave={() => setHoveredValue(null)}
                            />
                        ))}
                    </svg>

                    {/* Tooltip */}
                    {hoveredValue && (
                        <div className="absolute top-4 right-4 bg-popover text-popover-foreground border rounded px-3 py-1.5 text-sm shadow animate-in fade-in zoom-in">
                            <span className="font-semibold">{hoveredValue.date}</span>: ${hoveredValue.total.toFixed(2)}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
