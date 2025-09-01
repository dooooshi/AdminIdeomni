'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { Container } from '@mui/material';
import PageTitle from '@/components/PageTitle';
import { ResourceConsumptionHistory } from '@/components/production';

export default function StudentResourcesPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl">
      <PageTitle
        title={t('resources.title')}
        subtitle={t('resources.subtitle')}
      />
      
      <ResourceConsumptionHistory />
    </Container>
  );
}