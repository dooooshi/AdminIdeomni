import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import ShopService from '@/lib/services/shopService';
import type {
  ShopMaterial,
  ShopTransaction,
  MaterialQueryParams,
  AddMaterialRequest,
  UpdatePriceRequest,
  PurchaseRequest,
  TeamTransactionQueryParams,
  HistoryQueryParams,
  MaterialOrigin,
  FacilitySpace,
  ShopHistory,
  RawMaterial,
} from '@/types/shop';

// ==================== State Types ====================

export interface ShopState {
  // Materials
  materials: ShopMaterial[];
  selectedMaterial: ShopMaterial | null;
  materialsLoading: boolean;
  materialsError: string | null;

  // Available Raw Materials (for adding to shop)
  availableRawMaterials: RawMaterial[];
  rawMaterialsLoading: boolean;
  rawMaterialsError: string | null;

  // Filters and Sorting
  filters: {
    origin?: MaterialOrigin;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    inStock?: boolean;
  };
  sortConfig: {
    field: 'price' | 'name' | 'materialNumber';
    direction: 'asc' | 'desc';
  };

  // Purchase Flow
  purchaseFlow: {
    selectedMaterial: ShopMaterial | null;
    quantity: number;
    selectedFacilityId: string | null;
    isProcessing: boolean;
    error: string | null;
  };

  // Facility Spaces
  facilitySpaces: FacilitySpace[];
  facilitySpacesLoading: boolean;
  facilitySpacesError: string | null;

  // Transactions (Student)
  teamTransactions: ShopTransaction[];
  teamTransactionsSummary: {
    totalTransactions: number;
    totalSpent: string;
    uniqueMaterials: number;
  } | null;
  transactionsLoading: boolean;
  transactionsError: string | null;

  // Shop History (Manager)
  shopHistory: ShopHistory[];
  shopHistoryLoading: boolean;
  shopHistoryError: string | null;
  shopHistoryPagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  } | null;
}

const initialState: ShopState = {
  materials: [],
  selectedMaterial: null,
  materialsLoading: false,
  materialsError: null,

  availableRawMaterials: [],
  rawMaterialsLoading: false,
  rawMaterialsError: null,

  filters: {},
  sortConfig: {
    field: 'name',
    direction: 'asc',
  },

  purchaseFlow: {
    selectedMaterial: null,
    quantity: 1,
    selectedFacilityId: null,
    isProcessing: false,
    error: null,
  },

  facilitySpaces: [],
  facilitySpacesLoading: false,
  facilitySpacesError: null,

  teamTransactions: [],
  teamTransactionsSummary: null,
  transactionsLoading: false,
  transactionsError: null,

  shopHistory: [],
  shopHistoryLoading: false,
  shopHistoryError: null,
  shopHistoryPagination: null,
};

// ==================== Async Thunks ====================

// Fetch materials
export const fetchMaterials = createAsyncThunk(
  'shop/fetchMaterials',
  async (params?: MaterialQueryParams) => {
    const response = await ShopService.getMaterials(params);
    return response;
  }
);

// Fetch available raw materials (for adding to shop)
export const fetchAvailableRawMaterials = createAsyncThunk(
  'shop/fetchAvailableRawMaterials',
  async () => {
    const response = await ShopService.getAvailableRawMaterials();
    return response;
  }
);

// Add material (Manager)
export const addMaterial = createAsyncThunk(
  'shop/addMaterial',
  async (request: AddMaterialRequest) => {
    const response = await ShopService.addMaterial(request);
    return response;
  }
);

// Remove material (Manager)
export const removeMaterial = createAsyncThunk(
  'shop/removeMaterial',
  async (materialId: number) => {
    const response = await ShopService.removeMaterial(materialId);
    return { materialId, response };
  }
);

// Update material price (Manager)
export const updateMaterialPrice = createAsyncThunk(
  'shop/updateMaterialPrice',
  async ({ materialId, request }: { materialId: number; request: UpdatePriceRequest }) => {
    const response = await ShopService.updateMaterialPrice(materialId, request);
    return { materialId, response };
  }
);

// Fetch facility spaces (Student)
export const fetchFacilitySpaces = createAsyncThunk(
  'shop/fetchFacilitySpaces',
  async () => {
    const response = await ShopService.getTeamFacilitySpaces();
    return response.facilities;
  }
);

// Purchase material (Student)
export const purchaseMaterial = createAsyncThunk(
  'shop/purchaseMaterial',
  async (request: PurchaseRequest) => {
    const response = await ShopService.purchaseMaterial(request);
    return response;
  }
);

// Fetch team transactions (Student)
export const fetchTeamTransactions = createAsyncThunk(
  'shop/fetchTeamTransactions',
  async (params?: TeamTransactionQueryParams) => {
    const response = await ShopService.getTeamTransactions(params);
    return response;
  }
);

// Fetch shop history (Manager)
export const fetchShopHistory = createAsyncThunk(
  'shop/fetchShopHistory',
  async (params?: HistoryQueryParams) => {
    const response = await ShopService.getShopHistory(params);
    return response;
  }
);

// ==================== Slice ====================

export const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    // Material selection
    selectMaterial(state, action: PayloadAction<ShopMaterial | null>) {
      state.selectedMaterial = action.payload;
      if (action.payload) {
        state.purchaseFlow.selectedMaterial = action.payload;
      }
    },

    // Filter updates
    setFilters(state, action: PayloadAction<typeof initialState.filters>) {
      state.filters = action.payload;
    },

    updateFilter(state, action: PayloadAction<{ key: keyof typeof initialState.filters; value: any }>) {
      const { key, value } = action.payload;
      if (value === null || value === undefined || value === '') {
        delete state.filters[key];
      } else {
        (state.filters as any)[key] = value;
      }
    },

    clearFilters(state) {
      state.filters = {};
    },

    // Sorting
    setSortConfig(state, action: PayloadAction<typeof initialState.sortConfig>) {
      state.sortConfig = action.payload;
    },

    // Purchase flow
    setPurchaseQuantity(state, action: PayloadAction<number>) {
      state.purchaseFlow.quantity = Math.max(1, action.payload);
    },

    selectFacilitySpace(state, action: PayloadAction<string>) {
      state.purchaseFlow.selectedFacilityId = action.payload;
    },

    resetPurchaseFlow(state) {
      state.purchaseFlow = initialState.purchaseFlow;
    },

    // Clear errors
    clearMaterialsError(state) {
      state.materialsError = null;
    },

    clearPurchaseError(state) {
      state.purchaseFlow.error = null;
    },

    clearTransactionsError(state) {
      state.transactionsError = null;
    },

    // Reset state
    resetShopState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch materials
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.materialsLoading = true;
        state.materialsError = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.materialsLoading = false;
        state.materials = action.payload.materials;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.materialsLoading = false;
        state.materialsError = action.error.message || 'Failed to fetch materials';
      });

    // Fetch available raw materials
    builder
      .addCase(fetchAvailableRawMaterials.pending, (state) => {
        state.rawMaterialsLoading = true;
        state.rawMaterialsError = null;
      })
      .addCase(fetchAvailableRawMaterials.fulfilled, (state, action) => {
        state.rawMaterialsLoading = false;
        state.availableRawMaterials = action.payload;
        state.rawMaterialsError = null;
      })
      .addCase(fetchAvailableRawMaterials.rejected, (state, action) => {
        state.rawMaterialsLoading = false;
        state.rawMaterialsError = action.error.message || 'Failed to fetch raw materials';
      });

    // Add material
    builder
      .addCase(addMaterial.pending, (state) => {
        state.materialsLoading = true;
        state.materialsError = null;
      })
      .addCase(addMaterial.fulfilled, (state) => {
        state.materialsLoading = false;
        // Refetch materials to get updated list
      })
      .addCase(addMaterial.rejected, (state, action) => {
        state.materialsLoading = false;
        state.materialsError = action.error.message || 'Failed to add material';
      });

    // Remove material
    builder
      .addCase(removeMaterial.fulfilled, (state, action) => {
        state.materials = state.materials.filter(m => m.id !== action.payload.materialId);
      })
      .addCase(removeMaterial.rejected, (state, action) => {
        state.materialsError = action.error.message || 'Failed to remove material';
      });

    // Update material price
    builder
      .addCase(updateMaterialPrice.fulfilled, (state, action) => {
        const { materialId, response } = action.payload;
        const materialIndex = state.materials.findIndex(m => m.id === materialId);
        if (materialIndex >= 0) {
          state.materials[materialIndex].unitPrice = response.newPrice;
        }
      })
      .addCase(updateMaterialPrice.rejected, (state, action) => {
        state.materialsError = action.error.message || 'Failed to update price';
      });

    // Fetch facility spaces
    builder
      .addCase(fetchFacilitySpaces.pending, (state) => {
        state.facilitySpacesLoading = true;
        state.facilitySpacesError = null;
      })
      .addCase(fetchFacilitySpaces.fulfilled, (state, action) => {
        state.facilitySpacesLoading = false;
        state.facilitySpaces = action.payload;
      })
      .addCase(fetchFacilitySpaces.rejected, (state, action) => {
        state.facilitySpacesLoading = false;
        state.facilitySpacesError = action.error.message || 'Failed to fetch facility spaces';
      });

    // Purchase material
    builder
      .addCase(purchaseMaterial.pending, (state) => {
        state.purchaseFlow.isProcessing = true;
        state.purchaseFlow.error = null;
      })
      .addCase(purchaseMaterial.fulfilled, (state) => {
        state.purchaseFlow.isProcessing = false;
        state.purchaseFlow = initialState.purchaseFlow;
      })
      .addCase(purchaseMaterial.rejected, (state, action) => {
        state.purchaseFlow.isProcessing = false;
        state.purchaseFlow.error = action.error.message || 'Failed to complete purchase';
      });

    // Fetch team transactions
    builder
      .addCase(fetchTeamTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.transactionsError = null;
      })
      .addCase(fetchTeamTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.teamTransactions = action.payload.transactions;
        state.teamTransactionsSummary = action.payload.summary;
      })
      .addCase(fetchTeamTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.transactionsError = action.error.message || 'Failed to fetch transactions';
      });

    // Fetch shop history
    builder
      .addCase(fetchShopHistory.pending, (state) => {
        state.shopHistoryLoading = true;
        state.shopHistoryError = null;
      })
      .addCase(fetchShopHistory.fulfilled, (state, action) => {
        state.shopHistoryLoading = false;
        state.shopHistory = action.payload.history;
        state.shopHistoryPagination = action.payload.pagination;
      })
      .addCase(fetchShopHistory.rejected, (state, action) => {
        state.shopHistoryLoading = false;
        state.shopHistoryError = action.error.message || 'Failed to fetch shop history';
      });
  },
});

// ==================== Actions ====================

export const {
  selectMaterial,
  setFilters,
  updateFilter,
  clearFilters,
  setSortConfig,
  setPurchaseQuantity,
  selectFacilitySpace,
  resetPurchaseFlow,
  clearMaterialsError,
  clearPurchaseError,
  clearTransactionsError,
  resetShopState,
} = shopSlice.actions;

// ==================== Selectors ====================

// Get filtered and sorted materials
export const selectFilteredMaterials = (state: RootState) => {
  const { materials, filters, sortConfig } = state.shop;

  // Apply filters
  let filtered = ShopService.filterMaterials(materials, filters);

  // Apply sorting
  filtered = ShopService.sortMaterials(filtered, sortConfig.field, sortConfig.direction);

  return filtered;
};

// Get materials grouped by origin
export const selectMaterialsByOrigin = (state: RootState) => {
  const materials = selectFilteredMaterials(state);
  return ShopService.groupMaterialsByOrigin(materials);
};

// Purchase validation
export const selectPurchaseValidation = (state: RootState) => {
  const { purchaseFlow } = state.shop;
  const { selectedMaterial, quantity } = purchaseFlow;

  if (!selectedMaterial) {
    return { valid: false, error: 'No material selected' };
  }

  return ShopService.validatePurchase(selectedMaterial, quantity);
};

// Get purchase total cost
export const selectPurchaseTotalCost = (state: RootState) => {
  const { purchaseFlow } = state.shop;
  const { selectedMaterial, quantity } = purchaseFlow;

  if (!selectedMaterial) {
    return 0;
  }

  return ShopService.calculateTotalCost(selectedMaterial.unitPrice, quantity);
};

export default shopSlice.reducer;