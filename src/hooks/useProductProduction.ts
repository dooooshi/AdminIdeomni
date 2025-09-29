import { useState, useEffect, useCallback } from 'react';
import { 
  Factory, 
  ProductionHistoryItem,
  CostCalculationResponse 
} from '@/lib/types/productProduction';
import { ProductFormula } from '@/lib/types/productFormula';
import productProductionService from '@/lib/services/productProductionService';
import productFormulaService from '@/lib/services/productFormulaService';

export interface UseProductProductionReturn {
  // State
  factories: Factory[];
  formulas: ProductFormula[];
  selectedFactory: Factory | null;
  selectedFormula: ProductFormula | null;
  quantity: number;
  costData: CostCalculationResponse['data'] | null;
  productionHistory: ProductionHistoryItem[];
  totalHistoryCount: number;
  
  // Loading states
  loadingFactories: boolean;
  loadingFormulas: boolean;
  calculatingCost: boolean;
  producing: boolean;
  loadingHistory: boolean;
  
  // Errors
  factoriesError: string | null;
  formulasError: string | null;
  costError: string | null;
  productionError: string | null;
  historyError: string | null;
  
  // Actions
  setSelectedFactory: (factory: Factory | null) => void;
  setSelectedFormula: (formula: ProductFormula | null) => void;
  setQuantity: (quantity: number) => void;
  calculateCosts: () => Promise<void>;
  startProduction: () => Promise<boolean>;
  loadProductionHistory: (page: number, limit: number) => Promise<void>;
  refreshFactories: () => Promise<void>;
  refreshFormulas: () => Promise<void>;
}

export const useProductProduction = (): UseProductProductionReturn => {
  // State
  const [factories, setFactories] = useState<Factory[]>([]);
  const [formulas, setFormulas] = useState<ProductFormula[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<ProductFormula | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [costData, setCostData] = useState<CostCalculationResponse['data'] | null>(null);
  const [productionHistory, setProductionHistory] = useState<ProductionHistoryItem[]>([]);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  
  // Loading states
  const [loadingFactories, setLoadingFactories] = useState(false);
  const [loadingFormulas, setLoadingFormulas] = useState(false);
  const [calculatingCost, setCalculatingCost] = useState(false);
  const [producing, setProducing] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Errors
  const [factoriesError, setFactoriesError] = useState<string | null>(null);
  const [formulasError, setFormulasError] = useState<string | null>(null);
  const [costError, setCostError] = useState<string | null>(null);
  const [productionError, setProductionError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Load factories
  const loadFactories = useCallback(async () => {
    setLoadingFactories(true);
    setFactoriesError(null);
    try {
      const response = await productProductionService.getFactories();
      if (response.success && response.data?.factories) {
        setFactories(response.data.factories);
      }
    } catch (error) {
      setFactoriesError('Failed to load factories');
    } finally {
      setLoadingFactories(false);
    }
  }, []);

  // Load formulas
  const loadFormulas = useCallback(async () => {
    setLoadingFormulas(true);
    setFormulasError(null);
    try {
      const response = await productFormulaService.searchProductFormulas({ 
        page: 1, 
        limit: 100,
        isActive: true 
      });
      if (response.items) {
        setFormulas(response.items);
      }
    } catch (error) {
      setFormulasError('Failed to load formulas');
    } finally {
      setLoadingFormulas(false);
    }
  }, []);

  // Calculate costs
  const calculateCosts = useCallback(async () => {
    if (!selectedFactory || !selectedFormula || quantity <= 0) return;
    
    setCalculatingCost(true);
    setCostError(null);
    setCostData(null);
    
    try {
      const response = await productProductionService.calculateCost({
        factoryId: selectedFactory.id,
        formulaId: selectedFormula.id,
        quantity
      });
      
      if (response.success && response.data) {
        setCostData(response.data);
      } else {
        setCostError(response.details?.message || response.error?.message || response.message || 'Failed to calculate costs');
      }
    } catch (error: any) {
      setCostError(error.response?.data?.details?.message || error.response?.data?.message || 'Failed to calculate costs');
    } finally {
      setCalculatingCost(false);
    }
  }, [selectedFactory, selectedFormula, quantity]);

  // Start production
  const startProduction = useCallback(async (): Promise<boolean> => {
    if (!selectedFactory || !selectedFormula || !costData) return false;
    
    setProducing(true);
    setProductionError(null);
    
    try {
      const response = await productProductionService.executeProduction({
        factoryId: selectedFactory.id,
        formulaId: selectedFormula.id,
        quantity,
        costConfirmation: {
          expectedCost: costData.costs.finalCosts.totalCost,
          acceptPrice: true
        }
      });
      
      if (response.success) {
        // Reset state after successful production
        setSelectedFactory(null);
        setSelectedFormula(null);
        setQuantity(1);
        setCostData(null);
        return true;
      } else {
        setProductionError(response.details?.message || response.error?.message || response.message || 'Production failed');
        return false;
      }
    } catch (error: any) {
      setProductionError(error.response?.data?.details?.message || error.response?.data?.message || 'Production failed');
      return false;
    } finally {
      setProducing(false);
    }
  }, [selectedFactory, selectedFormula, quantity, costData]);

  // Load production history
  const loadProductionHistory = useCallback(async (page: number, limit: number) => {
    setLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const response = await productProductionService.getHistory({
        page,
        limit,
        sort: 'timestamps.completed',
        order: 'desc'
      });
      
      if (response.success && response.data) {
        setProductionHistory(response.data.history);
        setTotalHistoryCount(response.data.pagination?.total || 0);
      }
    } catch (error) {
      setHistoryError('Failed to load production history');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFactories();
    loadFormulas();
  }, [loadFactories, loadFormulas]);

  // Recalculate costs when selection changes
  useEffect(() => {
    if (selectedFactory && selectedFormula && quantity > 0) {
      calculateCosts();
    } else {
      setCostData(null);
    }
  }, [selectedFactory, selectedFormula, quantity, calculateCosts]);

  return {
    // State
    factories,
    formulas,
    selectedFactory,
    selectedFormula,
    quantity,
    costData,
    productionHistory,
    totalHistoryCount,
    
    // Loading states
    loadingFactories,
    loadingFormulas,
    calculatingCost,
    producing,
    loadingHistory,
    
    // Errors
    factoriesError,
    formulasError,
    costError,
    productionError,
    historyError,
    
    // Actions
    setSelectedFactory,
    setSelectedFormula,
    setQuantity,
    calculateCosts,
    startProduction,
    loadProductionHistory,
    refreshFactories: loadFactories,
    refreshFormulas: loadFormulas
  };
};