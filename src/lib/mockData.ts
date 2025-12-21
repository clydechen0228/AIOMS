export const mockOrders = [
    {
        id: "ORD-001",
        customer: "Global BioTech",
        product: "L-Leucine (USP)",
        quantity: "500kg",
        status: "Pending",
        date: "2023-10-25",
        amount: "$12,500",
    },
    {
        id: "ORD-002",
        customer: "NutriLife Solutions",
        product: "L-Valine (Food Grade)",
        quantity: "200kg",
        status: "Shipped",
        date: "2023-10-24",
        amount: "$4,200",
    },
    {
        id: "ORD-003",
        customer: "PharmaCore Inc.",
        product: "L-Isoleucine (EP)",
        quantity: "1000kg",
        status: "Delivered",
        date: "2023-10-23",
        amount: "$35,000",
    },
    {
        id: "ORD-004",
        customer: "AgroFeed Systems",
        product: "L-Lysine HCL",
        quantity: "5000kg",
        status: "Processing",
        date: "2023-10-22",
        amount: "$8,900",
    },
    {
        id: "ORD-005",
        customer: "MediPure Labs",
        product: "L-Glutamine",
        quantity: "150kg",
        status: "Pending",
        date: "2023-10-21",
        amount: "$3,100",
    },
];

export const mockMetrics = {
    totalRevenue: "$1.2M",
    activeOrders: "24",
    productsInStock: "145",
    newCustomers: "+12%",
};

export const mockCustomers = [
    { id: "CUST-001", name: "Global BioTech", email: "contact@globalbiotech.com" },
    { id: "CUST-002", name: "NutriLife Solutions", email: "purchasing@nutrilife.com" },
    { id: "CUST-003", name: "PharmaCore Inc.", email: "procurement@pharmacore.com" },
];

export const mockProducts = [
    { id: "PROD-001", name: "L-Leucine (USP)", cas: "61-90-5", purity: "99.0%" },
    { id: "PROD-002", name: "L-Valine (Food Grade)", cas: "72-18-4", purity: "98.5%" },
    { id: "PROD-003", name: "L-Isoleucine (EP)", cas: "73-32-5", purity: "99.5%" },
];
