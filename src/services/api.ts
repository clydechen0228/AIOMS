
// Define Types
export interface Order {
    id: string;
    customer: string;
    product: string;
    quantity: string;
    status: string;
    date: string;
    amount: string;
}

export interface Product {
    id: string;
    name: string;
    cas: string;
    purity: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
}

export interface Metrics {
    totalRevenue: string;
    activeOrders: string;
    productsInStock: string;
    newCustomers: string;
}

// Helper to cast DB IDs to string for frontend compatibility if needed
const castId = (item: any) => ({ ...item, id: String(item.id) });

const BASE_URL = 'http://127.0.0.1:3001';

export const api = {
    getOrders: async (): Promise<Order[]> => {
        const res = await fetch(`${BASE_URL}/api/orders`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        return data.map((o: any) => ({
            id: String(o.id),
            customer: o.customerName,
            product: o.productName,
            quantity: String(o.quantity),
            status: o.status,
            date: o.date,
            amount: o.amount
        }));
    },

    getOrderById: async (id: string): Promise<Order | undefined> => {
        const res = await fetch(`${BASE_URL}/api/orders/${id}`);
        if (!res.ok) {
            if (res.status === 404) return undefined;
            throw new Error('Failed to fetch order');
        }
        const o = await res.json();
        return {
            id: String(o.id),
            customer: o.customerName,
            product: o.productName,
            quantity: String(o.quantity),
            status: o.status,
            date: o.date,
            amount: o.amount
        };
    },

    getMetrics: async (): Promise<Metrics> => {
        const res = await fetch(`${BASE_URL}/api/metrics`);
        if (!res.ok) throw new Error('Failed to fetch metrics');
        return res.json();
    },

    getProducts: async (): Promise<Product[]> => {
        const res = await fetch(`${BASE_URL}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        return data.map(castId);
    },

    getCustomers: async (): Promise<Customer[]> => {
        const res = await fetch(`${BASE_URL}/api/customers`);
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        return data.map(castId);
    },

    createOrder: async (orderData: { customerId: string; productId: string; quantity: number; amount: number; date: string }) => {
        const res = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (!res.ok) throw new Error('Failed to create order');
        return res.json();
    },

    updateOrderStatus: async (id: string, status: string) => {
        const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update status');
        return res.json();
    },

    getSalesData: async (): Promise<{ date: string; total: number }[]> => {
        const res = await fetch(`${BASE_URL}/api/sales`);
        if (!res.ok) throw new Error('Failed to fetch sales data');
        return res.json();
    }
};
