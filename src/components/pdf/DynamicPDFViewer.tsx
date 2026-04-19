"use client";

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface DynamicPDFViewerProps {
    fileUrl: string;
    onPageChange: (e: { currentPage: number; doc: any }) => void;
}

export default function DynamicPDFViewer({ fileUrl, onPageChange }: DynamicPDFViewerProps) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer
                fileUrl={fileUrl}
                plugins={[defaultLayoutPluginInstance]}
                onPageChange={onPageChange}
            />
        </Worker>
    );
}
