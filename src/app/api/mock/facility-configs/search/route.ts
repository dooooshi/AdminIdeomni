import { NextRequest, NextResponse } from 'next/server';
import { FacilityType, FacilityCategory } from '@/lib/services/facilityService';

// Mock facility configuration data
const mockFacilityConfigs = [
  {
    id: 'fc-1',
    facilityType: FacilityType.MINE,
    category: FacilityCategory.RAW_MATERIAL_PRODUCTION,
    name: 'Mining Facility',
    description: 'Large-scale mineral extraction operations',
    defaultCapacity: 5000,
    defaultMaintenanceCost: 8000,
    defaultBuildCost: 150000,
    defaultOperationCost: 1200,
    minCapacity: 500,
    maxCapacity: 50000,
    minBuildCost: 50000,
    maxBuildCost: 500000,
    minMaintenanceCost: 2000,
    maxMaintenanceCost: 20000,
    minOperationCost: 500,
    maxOperationCost: 5000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-2',
    facilityType: FacilityType.QUARRY,
    category: FacilityCategory.RAW_MATERIAL_PRODUCTION,
    name: 'Quarry Facility',
    description: 'Stone and aggregate extraction',
    defaultCapacity: 4000,
    defaultMaintenanceCost: 6000,
    defaultBuildCost: 120000,
    defaultOperationCost: 900,
    minCapacity: 400,
    maxCapacity: 40000,
    minBuildCost: 40000,
    maxBuildCost: 400000,
    minMaintenanceCost: 1500,
    maxMaintenanceCost: 15000,
    minOperationCost: 400,
    maxOperationCost: 4000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-3',
    facilityType: FacilityType.FOREST,
    category: FacilityCategory.RAW_MATERIAL_PRODUCTION,
    name: 'Forest Facility',
    description: 'Sustainable timber operations',
    defaultCapacity: 3000,
    defaultMaintenanceCost: 4000,
    defaultBuildCost: 80000,
    defaultOperationCost: 600,
    minCapacity: 300,
    maxCapacity: 30000,
    minBuildCost: 30000,
    maxBuildCost: 300000,
    minMaintenanceCost: 1000,
    maxMaintenanceCost: 10000,
    minOperationCost: 300,
    maxOperationCost: 3000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-4',
    facilityType: FacilityType.FARM,
    category: FacilityCategory.RAW_MATERIAL_PRODUCTION,
    name: 'Agricultural Farm',
    description: 'Crop production facility',
    defaultCapacity: 6000,
    defaultMaintenanceCost: 5000,
    defaultBuildCost: 100000,
    defaultOperationCost: 800,
    minCapacity: 600,
    maxCapacity: 60000,
    minBuildCost: 35000,
    maxBuildCost: 350000,
    minMaintenanceCost: 1200,
    maxMaintenanceCost: 12000,
    minOperationCost: 350,
    maxOperationCost: 3500,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-5',
    facilityType: FacilityType.RANCH,
    category: FacilityCategory.RAW_MATERIAL_PRODUCTION,
    name: 'Livestock Ranch',
    description: 'Animal husbandry operations',
    defaultCapacity: 4500,
    defaultMaintenanceCost: 4500,
    defaultBuildCost: 90000,
    defaultOperationCost: 700,
    minCapacity: 450,
    maxCapacity: 45000,
    minBuildCost: 32000,
    maxBuildCost: 320000,
    minMaintenanceCost: 1100,
    maxMaintenanceCost: 11000,
    minOperationCost: 320,
    maxOperationCost: 3200,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-6',
    facilityType: FacilityType.FISHERY,
    category: FacilityCategory.RAW_MATERIAL_PRODUCTION,
    name: 'Fishery',
    description: 'Aquaculture operations',
    defaultCapacity: 3500,
    defaultMaintenanceCost: 3500,
    defaultBuildCost: 70000,
    defaultOperationCost: 500,
    minCapacity: 350,
    maxCapacity: 35000,
    minBuildCost: 25000,
    maxBuildCost: 250000,
    minMaintenanceCost: 800,
    maxMaintenanceCost: 8000,
    minOperationCost: 250,
    maxOperationCost: 2500,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-7',
    facilityType: FacilityType.FACTORY,
    category: FacilityCategory.FUNCTIONAL,
    name: 'Manufacturing Factory',
    description: 'Industrial production facility',
    defaultCapacity: 10000,
    defaultMaintenanceCost: 12000,
    defaultBuildCost: 250000,
    defaultOperationCost: 2000,
    minCapacity: 1000,
    maxCapacity: 100000,
    minBuildCost: 80000,
    maxBuildCost: 800000,
    minMaintenanceCost: 3000,
    maxMaintenanceCost: 30000,
    minOperationCost: 800,
    maxOperationCost: 8000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-8',
    facilityType: FacilityType.MALL,
    category: FacilityCategory.FUNCTIONAL,
    name: 'Shopping Mall',
    description: 'Commercial retail center',
    defaultCapacity: 8000,
    defaultMaintenanceCost: 10000,
    defaultBuildCost: 300000,
    defaultOperationCost: 1500,
    minCapacity: 800,
    maxCapacity: 80000,
    minBuildCost: 100000,
    maxBuildCost: 1000000,
    minMaintenanceCost: 2500,
    maxMaintenanceCost: 25000,
    minOperationCost: 600,
    maxOperationCost: 6000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-9',
    facilityType: FacilityType.WAREHOUSE,
    category: FacilityCategory.FUNCTIONAL,
    name: 'Storage Warehouse',
    description: 'Goods storage and distribution',
    defaultCapacity: 15000,
    defaultMaintenanceCost: 8000,
    defaultBuildCost: 180000,
    defaultOperationCost: 1000,
    minCapacity: 1500,
    maxCapacity: 150000,
    minBuildCost: 60000,
    maxBuildCost: 600000,
    minMaintenanceCost: 2000,
    maxMaintenanceCost: 20000,
    minOperationCost: 400,
    maxOperationCost: 4000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-10',
    facilityType: FacilityType.MEDIA_BUILDING,
    category: FacilityCategory.FUNCTIONAL,
    name: 'Media Center',
    description: 'Broadcasting and media operations',
    defaultCapacity: 2000,
    defaultMaintenanceCost: 6000,
    defaultBuildCost: 200000,
    defaultOperationCost: 1200,
    minCapacity: 200,
    maxCapacity: 20000,
    minBuildCost: 70000,
    maxBuildCost: 700000,
    minMaintenanceCost: 1500,
    maxMaintenanceCost: 15000,
    minOperationCost: 500,
    maxOperationCost: 5000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-11',
    facilityType: FacilityType.WATER_PLANT,
    category: FacilityCategory.INFRASTRUCTURE,
    name: 'Water Treatment Plant',
    description: 'Water purification and distribution',
    defaultCapacity: 20000,
    defaultMaintenanceCost: 15000,
    defaultBuildCost: 400000,
    defaultOperationCost: 2500,
    minCapacity: 2000,
    maxCapacity: 200000,
    minBuildCost: 150000,
    maxBuildCost: 1500000,
    minMaintenanceCost: 4000,
    maxMaintenanceCost: 40000,
    minOperationCost: 1000,
    maxOperationCost: 10000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-12',
    facilityType: FacilityType.POWER_PLANT,
    category: FacilityCategory.INFRASTRUCTURE,
    name: 'Power Generation Plant',
    description: 'Electricity generation facility',
    defaultCapacity: 25000,
    defaultMaintenanceCost: 20000,
    defaultBuildCost: 500000,
    defaultOperationCost: 3000,
    minCapacity: 2500,
    maxCapacity: 250000,
    minBuildCost: 200000,
    maxBuildCost: 2000000,
    minMaintenanceCost: 5000,
    maxMaintenanceCost: 50000,
    minOperationCost: 1200,
    maxOperationCost: 12000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-13',
    facilityType: FacilityType.BASE_STATION,
    category: FacilityCategory.INFRASTRUCTURE,
    name: 'Communication Base Station',
    description: 'Telecommunications infrastructure',
    defaultCapacity: 5000,
    defaultMaintenanceCost: 4000,
    defaultBuildCost: 120000,
    defaultOperationCost: 800,
    minCapacity: 500,
    maxCapacity: 50000,
    minBuildCost: 40000,
    maxBuildCost: 400000,
    minMaintenanceCost: 1000,
    maxMaintenanceCost: 10000,
    minOperationCost: 300,
    maxOperationCost: 3000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-14',
    facilityType: FacilityType.FIRE_STATION,
    category: FacilityCategory.OTHER,
    name: 'Fire Station',
    description: 'Emergency fire response facility',
    defaultCapacity: 1000,
    defaultMaintenanceCost: 5000,
    defaultBuildCost: 150000,
    defaultOperationCost: 1000,
    minCapacity: 100,
    maxCapacity: 10000,
    minBuildCost: 50000,
    maxBuildCost: 500000,
    minMaintenanceCost: 1200,
    maxMaintenanceCost: 12000,
    minOperationCost: 400,
    maxOperationCost: 4000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-15',
    facilityType: FacilityType.SCHOOL,
    category: FacilityCategory.OTHER,
    name: 'Educational School',
    description: 'Primary and secondary education',
    defaultCapacity: 2000,
    defaultMaintenanceCost: 8000,
    defaultBuildCost: 200000,
    defaultOperationCost: 1500,
    minCapacity: 200,
    maxCapacity: 20000,
    minBuildCost: 80000,
    maxBuildCost: 800000,
    minMaintenanceCost: 2000,
    maxMaintenanceCost: 20000,
    minOperationCost: 600,
    maxOperationCost: 6000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-16',
    facilityType: FacilityType.HOSPITAL,
    category: FacilityCategory.OTHER,
    name: 'Medical Hospital',
    description: 'Healthcare and medical services',
    defaultCapacity: 3000,
    defaultMaintenanceCost: 15000,
    defaultBuildCost: 400000,
    defaultOperationCost: 2500,
    minCapacity: 300,
    maxCapacity: 30000,
    minBuildCost: 150000,
    maxBuildCost: 1500000,
    minMaintenanceCost: 4000,
    maxMaintenanceCost: 40000,
    minOperationCost: 1000,
    maxOperationCost: 10000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-17',
    facilityType: FacilityType.PARK,
    category: FacilityCategory.OTHER,
    name: 'Public Park',
    description: 'Recreational green space',
    defaultCapacity: 4000,
    defaultMaintenanceCost: 3000,
    defaultBuildCost: 100000,
    defaultOperationCost: 500,
    minCapacity: 400,
    maxCapacity: 40000,
    minBuildCost: 30000,
    maxBuildCost: 300000,
    minMaintenanceCost: 800,
    maxMaintenanceCost: 8000,
    minOperationCost: 200,
    maxOperationCost: 2000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'fc-18',
    facilityType: FacilityType.CINEMA,
    category: FacilityCategory.OTHER,
    name: 'Movie Cinema',
    description: 'Entertainment and movie theater',
    defaultCapacity: 1500,
    defaultMaintenanceCost: 4000,
    defaultBuildCost: 120000,
    defaultOperationCost: 800,
    minCapacity: 150,
    maxCapacity: 15000,
    minBuildCost: 40000,
    maxBuildCost: 400000,
    minMaintenanceCost: 1000,
    maxMaintenanceCost: 10000,
    minOperationCost: 300,
    maxOperationCost: 3000,
    isActive: true,
    isDeleted: false,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search') || '';
    const facilityType = searchParams.get('facilityType') || '';
    const category = searchParams.get('category') || '';
    const isActiveParam = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const sortBy = searchParams.get('sortBy') || 'facilityType';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    console.log('🔍 Mock API: facility-configs/search called with params:', {
      search,
      facilityType,
      category,
      isActive: isActiveParam,
      page,
      pageSize,
      sortBy,
      sortOrder
    });

    // Filter configurations
    let filteredConfigs = [...mockFacilityConfigs];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredConfigs = filteredConfigs.filter(config =>
        config.name.toLowerCase().includes(searchLower) ||
        config.description.toLowerCase().includes(searchLower) ||
        config.facilityType.toLowerCase().includes(searchLower)
      );
    }

    // Apply facility type filter
    if (facilityType) {
      filteredConfigs = filteredConfigs.filter(config => config.facilityType === facilityType);
    }

    // Apply category filter
    if (category) {
      filteredConfigs = filteredConfigs.filter(config => config.category === category);
    }

    // Apply active status filter
    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      filteredConfigs = filteredConfigs.filter(config => config.isActive === isActive);
    }

    // Apply sorting
    filteredConfigs.sort((a, b) => {
      let aVal = a[sortBy as keyof typeof a];
      let bVal = b[sortBy as keyof typeof b];

      // Handle different data types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Calculate pagination
    const total = filteredConfigs.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedConfigs = filteredConfigs.slice(startIndex, endIndex);

    const response = {
      success: true,
      data: {
        data: paginatedConfigs,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };

    console.log('✅ Mock API: Returning response:', {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: response.data.hasNext,
      hasPrevious: response.data.hasPrevious,
      itemsReturned: paginatedConfigs.length
    });

    // Add delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Mock API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: null
      },
      { status: 500 }
    );
  }
}