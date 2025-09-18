'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import ManagerProductFormulaService from '@/lib/services/managerProductFormulaService';
import {
  UpdateManagerProductFormulaDto,
  ManagerProductFormula,
  ManagerProductFormulaMaterial,
  ManagerProductFormulaCraftCategory,
  ManagerRawMaterial,
  ManagerCraftCategory
} from '@/lib/types/managerProductFormula';
import ManagerMaterialSelector from './ManagerMaterialSelector';
import ManagerCraftCategorySelector from './ManagerCraftCategorySelector';
import ManagerCostCalculatorPanel from './ManagerCostCalculatorPanel';

interface EditManagerFormulaModalProps {
  open: boolean;
  formula: ManagerProductFormula;
  onClose: () => void;
  onSuccess: () => void;
}

const EditManagerFormulaModal: React.FC<EditManagerFormulaModalProps> = ({
  open,
  formula,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [materials, setMaterials] = useState<ManagerProductFormulaMaterial[]>([]);
  const [craftCategories, setCraftCategories] = useState<ManagerProductFormulaCraftCategory[]>([]);

  useEffect(() => {
    if (open && formula) {
      loadFormula();
    }
  }, [open, formula]);

  const loadFormula = async () => {
    try {
      const fullFormula = await ManagerProductFormulaService.getProductFormulaById(formula.id);
      setProductName(fullFormula.productName);
      setProductDescription(fullFormula.productDescription || '');
      setMaterials(fullFormula.materials || []);
      setCraftCategories(fullFormula.craftCategories || []);
    } catch (error) {
      console.error('Failed to load formula details:', error);
      enqueueSnackbar(t('managerProductFormula.errors.loadFailed'), { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (formula.isLocked) {
      enqueueSnackbar(t('managerProductFormula.errors.formulaLocked'), { variant: 'error' });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const dto: UpdateManagerProductFormulaDto = {
        productName,
        productDescription: productDescription || undefined,
        materials: materials.map(m => ({
          rawMaterialId: m.rawMaterialId,
          quantity: m.quantity,
          unit: m.unit || 'units'
        })),
        craftCategoryIds: craftCategories.map(c => c.craftCategoryId)
      };

      await ManagerProductFormulaService.updateProductFormula(formula.id, dto);
      enqueueSnackbar(t('managerProductFormula.updateSuccess'), { variant: 'success' });
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || t('managerProductFormula.errors.updateFailed');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!productName.trim()) {
      enqueueSnackbar(t('managerProductFormula.errors.productNameRequired'), { variant: 'error' });
      return false;
    }

    if (productName.length > 200) {
      enqueueSnackbar(t('managerProductFormula.errors.productNameTooLong'), { variant: 'error' });
      return false;
    }

    if (materials.length === 0) {
      enqueueSnackbar(t('managerProductFormula.errors.materialsRequired'), { variant: 'error' });
      return false;
    }

    if (craftCategories.length === 0) {
      enqueueSnackbar(t('managerProductFormula.errors.craftCategoriesRequired'), { variant: 'error' });
      return false;
    }

    const categoryTypes = new Set();
    for (const category of craftCategories) {
      const categoryType = category.craftCategory?.categoryType;
      if (categoryType && categoryTypes.has(categoryType)) {
        enqueueSnackbar(t('managerProductFormula.errors.duplicateCategoryType'), { variant: 'error' });
        return false;
      }
      if (categoryType) categoryTypes.add(categoryType);
    }

    return true;
  };

  const calculatedCosts = ManagerProductFormulaService.calculateCosts(
    materials.map(m => ({
      rawMaterialId: m.rawMaterialId,
      quantity: m.quantity
    })),
    craftCategories.map(c => ({
      craftCategoryId: c.craftCategoryId
    })),
    materials.map(m => m.rawMaterial).filter(Boolean) as ManagerRawMaterial[],
    craftCategories.map(c => c.craftCategory).filter(Boolean) as ManagerCraftCategory[]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <span>{t('managerProductFormula.editFormula')}</span>
          {formula?.isLocked && (
            <Chip
              label={t('managerProductFormula.locked')}
              size="small"
              color="error"
              icon={<LockIcon fontSize="small" />}
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {formula?.isLocked && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('managerProductFormula.lockedWarning')}
          </Alert>
        )}

        <Stack spacing={3}>
          <Box>
            <TextField
              fullWidth
              label={t('managerProductFormula.productName')}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              helperText={t('managerProductFormula.productNameHelper')}
              inputProps={{ maxLength: 200 }}
              disabled={formula?.isLocked || loading}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('managerProductFormula.productDescription')}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              helperText={t('managerProductFormula.productDescriptionHelper')}
              inputProps={{ maxLength: 500 }}
              disabled={formula?.isLocked || loading}
            />
          </Box>

          <Divider />

          <ManagerMaterialSelector
            materials={materials}
            onChange={setMaterials}
            disabled={formula?.isLocked || loading}
          />

          <Divider />

          <ManagerCraftCategorySelector
            craftCategories={craftCategories}
            onChange={setCraftCategories}
            disabled={formula?.isLocked || loading}
          />

          <Divider />

          <ManagerCostCalculatorPanel costs={calculatedCosts} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || formula?.isLocked}
        >
          {loading ? <CircularProgress size={20} /> : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditManagerFormulaModal;