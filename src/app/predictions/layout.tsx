import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prediction Markets — Forecast & Earn',
  description: 'Make predictions on world events, technology, sports, crypto and more. Correct predictions earn WSR tokens. AI-powered analysis helps you make better forecasts.',
  keywords: ['prediction markets', 'forecast events', 'earn predictions', 'event forecasting', 'polymarket', 'prediction platform', 'crowd forecasting'],
  alternates: { canonical: 'https://wisery.live/predictions' },
  openGraph: {
    title: 'Prediction Markets | Wisery',
    description: 'Predict outcomes, earn rewards. AI analysis on every market.',
    url: 'https://wisery.live/predictions',
  },
};

export default function PredictionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
