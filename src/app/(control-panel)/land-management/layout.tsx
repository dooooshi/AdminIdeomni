import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Land Management | AdminIdeomni',
  description: 'Comprehensive land management system for business simulation activities',
};

interface LandManagementLayoutProps {
  children: React.ReactNode;
}

export default function LandManagementLayout({ children }: LandManagementLayoutProps) {
  return <>{children}</>;
}