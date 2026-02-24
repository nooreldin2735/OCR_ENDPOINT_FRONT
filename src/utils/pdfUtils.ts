import * as pdfjsLib from 'pdfjs-dist';

// Set worker path (using a CDN for the worker to avoid complex vite config issues)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function convertPdfToImages(file: File): Promise<File[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: File[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for better OCR quality

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
        });

        if (blob) {
            const imageFile = new File([blob], `${file.name.replace(/\.pdf$/i, '')}_page_${i}.jpg`, {
                type: 'image/jpeg'
            });
            images.push(imageFile);
        }
    }

    return images;
}
