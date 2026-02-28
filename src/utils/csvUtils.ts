import type { LineItem } from "../types/ocr";

export function generateCsvFromLineItems(lineItems: LineItem[]): string {
    if (!lineItems || lineItems.length === 0) return "";

    const headers = [
        "Company From",
        "Company To",
        "Invoice Number",
        "Product/Goods",
        "Unit Price",
        "Whole Price Amount",
        "Total Price"
    ];

    const rows = lineItems
        .filter(item => {
            const val = item.whole_price_amount?.trim();
            if (!val) return false;
            // Keep only rows where whole_price_amount is numeric
            // Skip "free", "FOC", or empty strings
            return /^[0-9,.$ \-]+$/.test(val) && /[0-9]/.test(val);
        })
        .map(item => [
            `"${(item.company_from || "").replace(/"/g, '""')}"`,
            `"${(item.company_to || "").replace(/"/g, '""')}"`,
            `"${(item.invoice_number || "").replace(/"/g, '""')}"`,
            `"${(item.goods_products || "").replace(/"/g, '""')}"`,
            `"${(item.unit_price || "").replace(/"/g, '""')}"`,
            `"${(item.whole_price_amount || "").replace(/"/g, '""')}"`,
            `"${(item.total_price || "").replace(/"/g, '""')}"`
        ]);

    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}
