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

export interface OCRResponse {
    pages: Page[];
    metadata: {
        source_type: string;
        model: string;
        processed_pages: number;
    };
}
