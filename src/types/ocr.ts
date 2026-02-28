export interface BBox {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
}

export interface Line {
    text: string;
    bbox: BBox;
    words: any[];
}

export interface Block {
    id: string;
    type: string;
    bbox: BBox;
    lines: Line[];
}

export interface Page {
    page_number: number;
    width: number;
    height: number;
    blocks: Block[];
}

export interface LineItem {
    company_from: string;
    company_to: string;
    invoice_number: string;
    goods_products: string;
    quantity: string;
    unit_price: string;
    currency: string;
    whole_price_amount: string;
    total_price: string;
}

export interface OCRResponse {
    pages: Page[];
    markdown?: string;
    csv?: string;
    line_items?: LineItem[];
    metadata: {
        source_type: string;
        model: string;
        processed_pages: number;
    };
}

export interface OCRHistoryEntry {
    id: string;
    timestamp: number;
    fileName: string;
    imageUrl: string; // Base64 or Object URL (if temporary)
    data: OCRResponse;
}

export type BulkOCRResponse = OCRResponse[];
