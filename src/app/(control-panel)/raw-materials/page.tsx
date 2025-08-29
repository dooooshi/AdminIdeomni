'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { Container, Box, Typography } from '@mui/material';
import RawMaterialList from '@/components/raw-material/RawMaterialList';
import RawMaterialForm from '@/components/raw-material/RawMaterialForm';
import RawMaterialDetailsDialog from '@/components/raw-material/RawMaterialDetailsDialog';
import RawMaterialAuditLog from '@/components/raw-material/RawMaterialAuditLog';
import { RawMaterial } from '@/lib/types/rawMaterial';

// TODO: Get actual admin type from auth context
const ADMIN_TYPE = 1; // 1 = Super Admin, 2 = Limited Admin

export default function RawMaterialsPage() {
  const { t } = useTranslation();
  const isSuperAdmin = ADMIN_TYPE === 1;

  // State for dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  // Handle create material
  const handleCreateMaterial = () => {
    setSelectedMaterial(null);
    setFormOpen(true);
  };

  // Handle edit material
  const handleEditMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setFormOpen(true);
  };

  // Handle view material
  const handleViewMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setDetailsOpen(true);
  };

  // Handle view audit log
  const handleViewAuditLog = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setAuditLogOpen(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedMaterial(null);
    // Trigger list refresh
    setRefreshList(prev => prev + 1);
  };

  // Handle edit from details
  const handleEditFromDetails = (material: RawMaterial) => {
    setDetailsOpen(false);
    handleEditMaterial(material);
  };

  // Handle view history from details
  const handleViewHistoryFromDetails = (material: RawMaterial) => {
    setDetailsOpen(false);
    handleViewAuditLog(material);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            {t('rawMaterial.management.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('rawMaterial.management.description')}
          </Typography>
        </Box>

        {/* Material List */}
        <RawMaterialList
          key={refreshList}
          onCreateMaterial={handleCreateMaterial}
          onEditMaterial={handleEditMaterial}
          onViewMaterial={handleViewMaterial}
          onViewAuditLog={handleViewAuditLog}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Create/Edit Form Dialog */}
        <RawMaterialForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedMaterial(null);
          }}
          onSuccess={handleFormSuccess}
          material={selectedMaterial}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Details Dialog */}
        <RawMaterialDetailsDialog
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedMaterial(null);
          }}
          material={selectedMaterial}
          onEdit={handleEditFromDetails}
          onViewHistory={handleViewHistoryFromDetails}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Audit Log Dialog */}
        <RawMaterialAuditLog
          open={auditLogOpen}
          onClose={() => {
            setAuditLogOpen(false);
            setSelectedMaterial(null);
          }}
          material={selectedMaterial}
        />
      </Box>
    </Container>
  );
}