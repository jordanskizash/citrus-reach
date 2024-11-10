'use client';

import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import * as pdfjs from 'pdfjs-dist';

interface PdfFile {
  name: string;
  url: string;
}

interface PdfViewerProps {
  files: PdfFile[];
  onDelete: (index: number) => void;
}

export default function PdfViewer({ files, onDelete }: PdfViewerProps) {
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isWorkerLoaded, setIsWorkerLoaded] = useState(false);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    setIsWorkerLoaded(true);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  if (!isWorkerLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {files.map((file, index) => (
        <div key={index} className="relative bg-white p-4 rounded-lg shadow">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onDelete(index)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="h-40 mb-2">
            <Document
              file={file.url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                </div>
              }
              error={
                <div className="h-full flex items-center justify-center text-red-500">
                  Failed to load PDF
                </div>
              }
            >
              <Page 
                pageNumber={1} 
                width={150}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
          <h3 className="font-medium truncate">{file.name}</h3>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setSelectedPdf(file)}
          >
            Preview
          </Button>
        </div>
      ))}

      <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPdf?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 h-[600px] overflow-y-auto">
            {selectedPdf && (
              <Document
                file={selectedPdf.url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="flex justify-center">Loading PDF...</div>}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={500}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setPageNumber(page => Math.max(page - 1, 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <span>
              Page {pageNumber} of {numPages}
            </span>
            <Button
              onClick={() => setPageNumber(page => Math.min(page + 1, numPages || 1))}
              disabled={pageNumber >= (numPages || 1)}
            >
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}