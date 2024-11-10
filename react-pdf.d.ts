declare module 'react-pdf' {
  import { ComponentType, ReactElement } from 'react';

  export interface DocumentProps {
    file: string | { url: string; };
    onLoadSuccess?: ({ numPages }: { numPages: number }) => void;
    onLoadError?: (error: Error) => void;
    loading?: ReactElement;
    error?: ReactElement;
    children?: ReactElement | ReactElement[];
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
}

declare module 'pdfjs-dist/build/pdf.worker.min.js' {
  const content: any;
  export default content;
}