'use client';

import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import PageTitle from '@/components/PageTitle';
import { TradeList, CreateTradeModal } from '@/components/trade';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';

export default function StudentTradePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCreateNew = () => {
    setCreateModalOpen(true);
  };

  const handleTradeCreated = (tradeId: string) => {
    // Navigate to the trade details page
    router.push(`/student-trade/${tradeId}`);
  };

  return (
    <Container maxWidth="xl">
      <PageTitle
        title={t('trade.title', 'Trade Management')}
        subtitle={t('trade.subtitle', 'Manage trades between teams in your activity')}
      />

      <Box mt={3}>
        <TradeList
          onCreateNew={handleCreateNew}
        />
      </Box>

      <CreateTradeModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleTradeCreated}
      />
    </Container>
  );
}