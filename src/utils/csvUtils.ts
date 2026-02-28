import type { LineItem } from "../types/ocr";

export function generateCsvFromLineItems(lineItems: LineItem[]): string {
    if (!lineItems || lineItems.length === 0) return "";

    const headers = [
        "Company From",
        "Company To",
        "Invoice Number",
        "Product/Goods",
        "Quantity",
        "Unit Price",
        "Whole Price Amount",
        "Total Price"
    ];

    const rows = lineItems.map(item => [
        `"${(item.company_from || "").replace(/"/g, '""')}"`,
        `"${(item.company_to || "").replace(/"/g, '""')}"`,
        `"${(item.invoice_number || "").replace(/"/g, '""')}"`,
        `"${(item.goods_products || "").replace(/"/g, '""')}"`,
        `"${(item.quantity || "").replace(/"/g, '""')}"`,
        `"${(item.unit_price || "").replace(/"/g, '""')}"`,
        `"${(item.whole_price_amount || "").replace(/"/g, '""')}"`,
        `"${(item.total_price || "").replace(/"/g, '""')}"`
    ]);

    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}
