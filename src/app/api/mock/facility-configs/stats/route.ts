import { NextResponse } from 'next/server';
import { FacilityCategory } from '@/lib/services/facilityService';

export async function GET() {
  try {
    console.log('📊 Mock API: facility-configs/stats called');

    const statsResponse = {
      success: true,
      data: {
        totalConfigs: 18,
        activeConfigs: 18,
        inactiveConfigs: 0,
        deletedConfigs: 0,
        configsByCategory: {
          [FacilityCategory.RAW_MATERIAL_PRODUCTION]: 6,
          [FacilityCategory.FUNCTIONAL]: 4,
          [FacilityCategory.INFRASTRUCTURE]: 3,
          [FacilityCategory.OTHER]: 5
        }
      }
    };

    console.log('✅ Mock API: Returning stats:', statsResponse.data);

    // Add delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json(statsResponse);
  } catch (error) {
    console.error('❌ Mock API Stats Error:', error);
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