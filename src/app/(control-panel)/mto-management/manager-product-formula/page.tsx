'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Container,
  Paper,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import PageTitle from '@/components/PageTitle';
import {
  ManagerProductFormulaList,
  CreateManagerFormulaModal,
  EditManagerFormulaModal,
  ManagerFormulaDetailView
} from '@/components/manager-product-formula';
import { ManagerProductFormula } from '@/lib/types/managerProductFormula';
import { useAuth } from '@/lib/auth/hooks';

export default function ManagerProductFormulaPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<ManagerProductFormula | null>(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleCreateClick = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setRefreshList(prev => prev + 1);
    setCreateModalOpen(false);
  };

  const handleEditClick = (formula: ManagerProductFormula) => {
    setSelectedFormula(formula);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setRefreshList(prev => prev + 1);
    setEditModalOpen(false);
    setSelectedFormula(null);
  };

  const handleViewFormula = (formula: ManagerProductFormula) => {
    setSelectedFormula(formula);
    setDetailModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setRefreshList(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">{t('common.unauthorized')}</Alert>
      </Container>
    );
  }

  // Check if user is a manager (userType === 1)
  // Only RegularUser has userType property
  const isManager = user && 'userType' in user && user.userType === 1;
  if (!isManager) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">{t('managerProductFormula.managerRoleRequired')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageTitle
        title={t('managerProductFormula.title')}
        subtitle={t('managerProductFormula.subtitle')}
      />

      <Paper sx={{ mt: 3, p: 3 }}>
        <ManagerProductFormulaList
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onViewClick={handleViewFormula}
          onDeleteSuccess={handleDeleteSuccess}
          refresh={refreshList}
        />
      </Paper>

      <CreateManagerFormulaModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedFormula && (
        <>
          <EditManagerFormulaModal
            open={editModalOpen}
            formula={selectedFormula}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedFormula(null);
            }}
            onSuccess={handleEditSuccess}
          />

          <ManagerFormulaDetailView
            open={detailModalOpen}
            formulaId={selectedFormula.id}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedFormula(null);
            }}
          />
        </>
      )}
    </Container>
  );
}