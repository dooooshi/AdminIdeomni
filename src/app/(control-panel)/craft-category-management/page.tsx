'use client';

import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { PageTitle } from '@/components/PageTitle';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { CraftCategoryList, CraftCategoryForm } from '@/components/craft-category';
import { CraftCategory } from '@/types/craftCategory';

export default function CraftCategoryManagementPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CraftCategory | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEditCategory = (category: CraftCategory) => {
    setSelectedCategory(category);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedCategory(null);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedCategory(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <PageBreadcrumb />
        
        <Box sx={{ mt: 3 }}>
          <CraftCategoryList
            key={refreshKey}
            onCreateCategory={handleCreateCategory}
            onEditCategory={handleEditCategory}
          />
        </Box>

        <CraftCategoryForm
          open={formOpen}
          category={selectedCategory}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      </Box>
    </Container>
  );
}