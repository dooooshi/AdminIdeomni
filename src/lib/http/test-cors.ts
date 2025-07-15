import { apiClient } from './index';

/**
 * Test function to verify CORS proxy is working
 * This can be called from browser console or component
 */
export async function testCorsProxy() {
  console.log('🧪 Testing CORS Proxy...');
  
  try {
    // Test a simple GET request that would normally cause CORS issues
    console.log('📡 Making test request...');
    
    const response = await apiClient.postAuth('/admin/login', {
      identifier: 'test@example.com',
      password: 'test123'
    });
    
    console.log('✅ CORS Proxy Test Success:', response);
    return { success: true, data: response };
    
  } catch (error) {
    console.log('❌ CORS Proxy Test Error:', error);
    
    // Check if it's a CORS error specifically
    if (error instanceof Error && error.message.includes('CORS')) {
      console.log('🚨 CORS Error Detected - Proxy may not be working correctly');
    } else {
      console.log('ℹ️  Non-CORS Error - This might be expected (e.g., invalid credentials)');
    }
    
    return { success: false, error };
  }
}

/**
 * Test function specifically for checking if proxy routing is working
 */
export async function testProxyRouting() {
  console.log('🧪 Testing Proxy Routing...');
  
  try {
    // Make a request and check the URL being used
    const config = apiClient as any;
    const axiosInstance = config.axiosInstance || config;
    
    console.log('📍 Current Axios Base URL:', axiosInstance.defaults?.baseURL);
    
    // Test with a simple endpoint that should exist
    const response = await fetch('/api/proxy/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log('📡 Proxy Response Status:', response.status);
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    console.log('📡 Proxy Response Headers:', headersObj);
    
    const data = await response.text();
    console.log('📡 Proxy Response Data:', data);
    
    return { 
      success: response.ok, 
      status: response.status, 
      data 
    };
    
  } catch (error) {
    console.log('❌ Proxy Routing Test Error:', error);
    return { success: false, error };
  }
}

// Make functions available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).testCorsProxy = testCorsProxy;
  (window as any).testProxyRouting = testProxyRouting;
  
  console.log('🔧 CORS Test Functions Available:');
  console.log('- testCorsProxy() - Test full API client with CORS proxy');
  console.log('- testProxyRouting() - Test proxy routing directly');
} 