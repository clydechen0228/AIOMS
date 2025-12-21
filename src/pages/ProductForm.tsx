import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export function ProductForm() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Chemical Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Product Name</label>
                        <Input placeholder="e.g. L-Leucine" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">CAS Number</label>
                            <Input placeholder="e.g. 61-90-5" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Purity</label>
                            <Input placeholder="e.g. 99.0%" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Molecular Formula</label>
                        <Input placeholder="e.g. C6H13NO2" />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Initial Stock (kg)</label>
                        <Input type="number" placeholder="0" />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => navigate("/products")}>Cancel</Button>
                        <Button onClick={() => navigate("/products")}>Save Product</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
