'use client';

import React from 'react';
import { VisitorAnalytics } from '@/types';
import { HistatsCounter } from './histats-counter';

interface VisitorStatsWidgetProps {
  analytics?: VisitorAnalytics;
  className?: string;
}

export function VisitorStatsWidget({ className = '' }: VisitorStatsWidgetProps) {
  return (
    <div id="visitor-statistics-widget" className={`inline-flex items-center ${className}`}>
      <HistatsCounter histatsId="5052606" showLabel={true} />
    </div>
  );
}
