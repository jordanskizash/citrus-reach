// lib/analytics.ts

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Pageview tracking
export const pageview = (url: string, { userId, pageType }: { userId?: string; pageType?: string } = {}) => {
  if (typeof window.gtag !== 'undefined') {
    console.log('Sending pageview:', {
      url,
      userId,
      pageType
    });

    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_path: url,
      custom_user_id: userId,
      page_type: pageType
    });
  } else {
    console.warn('gtag not initialized');
  }
};

interface EventParams {
  action: string;
  category: string;
  label: string;
  value?: number;
  userId?: string;
  pageType?: string;
  metadata?: Record<string, any>;
}

export const event = ({
  action,
  category,
  label,
  value,
  userId,
  pageType,
  metadata
}: EventParams) => {
  if (typeof window.gtag !== 'undefined') {
    // Debug log the event being sent
    console.log('Sending GA event:', {
      event_name: action,
      event_category: category,
      event_label: label,
      value,
      custom_user_id: userId,
      page_type: pageType,
      ...metadata
    });

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
      custom_user_id: userId,
      page_type: pageType,
      ...metadata
    });
  } else {
    console.warn('gtag not found');
  }
};

// Types for window.gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}