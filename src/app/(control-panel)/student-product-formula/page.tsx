'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Container,
  Paper
} from '@mui/material';
import PageTitle from '@/components/PageTitle';
import {
  ProductFormulaList,
  CreateFormulaModal,
  FormulaDetailView
} from '@/components/product-formula';
import { ProductFormula } from '@/lib/types/productFormula';

export default function StudentProductFormulaPage() {
  const { t } = useTranslation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState<number | null>(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleCreateClick = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setRefreshList(prev => prev + 1);
    setCreateModalOpen(false);
  };

  const handleViewFormula = (formula: ProductFormula) => {
    setSelectedFormulaId(formula.id);
    setDetailModalOpen(true);
  };


  return (
    <Container maxWidth="xl">
      <PageTitle
        title={t('productFormula.title')}
        subtitle={t('productFormula.subtitle')}
      />

      <Paper sx={{ mt: 3, p: 3 }}>
        <ProductFormulaList
          onCreateClick={handleCreateClick}
          onViewClick={handleViewFormula}
          refresh={refreshList}
        />
      </Paper>

      <CreateFormulaModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <FormulaDetailView
        open={detailModalOpen}
        formulaId={selectedFormulaId}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedFormulaId(null);
        }}
      />
    </Container>
  );
}