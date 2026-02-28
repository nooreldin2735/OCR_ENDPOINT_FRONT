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
        "Currency",
        "Whole Price Amount (USD)",
        "Whole Price Amount (EGP)",
        "Total Price (EGP)"
    ];

    let runningTotalEGP = 0;

    const rows = lineItems
        .filter(item => {
            const val = item.whole_price_amount?.toString().trim();
            if (!val) return false;
            // Keep only rows where whole_price_amount is numeric
            return /^[0-9,.$ \-]+$/.test(val) && /[0-9]/.test(val);
        })
        .map(item => {
            const currency = (item.currency || "USD").toUpperCase();
            const rawAmount = parseFloat(item.whole_price_amount.toString().replace(/,/g, "")) || 0;

            let usdAmount = 0;
            let egpAmount = 0;

            if (currency === "USD") {
                usdAmount = rawAmount;
                egpAmount = rawAmount * 47.87;
            } else if (currency === "EGP") {
                egpAmount = rawAmount;
                usdAmount = rawAmount / 47.87;
            }

            runningTotalEGP += egpAmount;

            return [
                `"${(item.company_from || "").replace(/"/g, '""')}"`,
                `"${(item.company_to || "").replace(/"/g, '""')}"`,
                `"${(item.invoice_number || "").replace(/"/g, '""')}"`,
                `"${(item.goods_products || "").replace(/"/g, '""')}"`,
                `"${(item.quantity || "").replace(/"/g, '""')}"`,
                `"${(item.unit_price || "").replace(/"/g, '""')}"`,
                `"${currency}"`,
                `"${usdAmount.toFixed(2)}"`,
                `"${egpAmount.toFixed(2)}"`,
                `"${runningTotalEGP.toFixed(2)}"`
            ];
        });

    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}
