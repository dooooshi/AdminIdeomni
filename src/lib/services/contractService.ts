import apiClient from '@/lib/http/api-client';
import {
  Contract,
  ContractStatus,
  CreateContractRequest,
  CreateContractResponse,
  ContractListRequest,
  ContractListResponse,
  ContractDetailsResponse,
  ApproveContractResponse,
  RejectContractResponse,
  AvailableTeamsResponse,
  ContractHistoryRequest,
  ContractHistoryResponse,
  ContractErrorCode
} from '@/types/contract';

// Contract Service - Ultra Simple Contract Management
class ContractService {
  private readonly baseUrl = '/contract';

  /**
   * Create a new contract with teams
   * Requires Student role (userType: 3) and team membership
   */
  async createContract(data: CreateContractRequest): Promise<CreateContractResponse> {
    try {
      const response = await apiClient.post<any>(
        `${this.baseUrl}/create`,
        data
      );
      // The backend wraps the response in a data property
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get list of contracts for the authenticated team
   */
  async listContracts(params?: ContractListRequest): Promise<ContractListResponse> {
    try {
      const response = await apiClient.get<any>(
        `${this.baseUrl}/list`,
        { params }
      );
      // The backend wraps the response in a data property
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get full details of a specific contract
   */
  async getContractDetails(contractId: string): Promise<ContractDetailsResponse> {
    try {
      const response = await apiClient.get<any>(
        `${this.baseUrl}/${contractId}`
      );
      // The backend wraps the response in a data property
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Approve a contract for the user's team
   * Requires Student role and team membership
   */
  async approveContract(contractId: string): Promise<ApproveContractResponse> {
    try {
      const response = await apiClient.post<any>(
        `${this.baseUrl}/${contractId}/approve`,
        {}
      );
      // The backend wraps the response in a data property
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reject a contract for the user's team
   * Requires Student role and team membership
   */
  async rejectContract(contractId: string): Promise<RejectContractResponse> {
    try {
      const response = await apiClient.post<any>(
        `${this.baseUrl}/${contractId}/reject`,
        {}
      );
      // The backend wraps the response in a data property
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get list of teams in the user's activity (excluding user's own team)
   * Used for team selection when creating contracts
   */
  async getAvailableTeams(): Promise<AvailableTeamsResponse> {
    try {
      const response = await apiClient.get<any>(
        `${this.baseUrl}/teams/available`
      );
      // The backend wraps the response in a data property
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get operation history for a specific contract
   */
  async getContractHistory(params: ContractHistoryRequest): Promise<ContractHistoryResponse> {
    try {
      const { contractId, ...queryParams } = params;
      const response = await apiClient.get<any>(
        `${this.baseUrl}/${contractId}/history`,
        { params: queryParams }
      );
      // The backend wraps the response in a data property
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate contract creation data
   */
  validateContractData(data: CreateContractRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate title
    if (!data.title || data.title.length < 10) {
      errors.push('Title must be at least 10 characters long');
    }
    if (data.title && data.title.length > 200) {
      errors.push('Title must not exceed 200 characters');
    }

    // Validate content
    if (!data.content || data.content.length < 50) {
      errors.push('Content must be at least 50 characters long');
    }
    if (data.content && data.content.length > 10000) {
      errors.push('Content must not exceed 10000 characters');
    }

    // Validate teams
    if (!data.teamIds || data.teamIds.length < 1) {
      errors.push('At least one other team must be selected');
    }
    if (data.teamIds && data.teamIds.length > 9) {
      errors.push('Maximum 9 other teams can be added (10 total including your team)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get contract status display info
   */
  getStatusInfo(status: ContractStatus): {
    label: string;
    color: string;
    icon: string;
  } {
    switch (status) {
      case ContractStatus.PENDING_APPROVAL:
        return {
          label: 'Pending Approval',
          color: 'warning',
          icon: 'clock'
        };
      case ContractStatus.SIGNED:
        return {
          label: 'Signed',
          color: 'success',
          icon: 'check-circle'
        };
      case ContractStatus.REJECTED:
        return {
          label: 'Rejected',
          color: 'error',
          icon: 'x-circle'
        };
      default:
        return {
          label: 'Unknown',
          color: 'default',
          icon: 'question-mark-circle'
        };
    }
  }

  /**
   * Check if user can perform actions on contract
   */
  canApprove(contract: ContractDetailsResponse, userTeamId: string): boolean {
    // Check if contract is in pending status (handle both string and enum)
    const isPending = contract.status === 'PENDING_APPROVAL' || contract.status === ContractStatus.PENDING_APPROVAL;
    if (!isPending) {
      return false;
    }

    // Check if user's team is part of the contract
    const userTeam = contract.teams.find(t => t.teamId === userTeamId);
    if (!userTeam) {
      return false;
    }

    // Check if team hasn't already approved
    return !userTeam.approved;
  }

  canReject(contract: ContractDetailsResponse, userTeamId: string): boolean {
    // Check if contract is in pending status (handle both string and enum)
    const isPending = contract.status === 'PENDING_APPROVAL' || contract.status === ContractStatus.PENDING_APPROVAL;
    if (!isPending) {
      return false;
    }

    // Check if user's team is part of the contract
    const userTeam = contract.teams.find(t => t.teamId === userTeamId);
    return !!userTeam;
  }

  /**
   * Format contract number for display
   */
  formatContractNumber(contractNumber: string): string {
    // Format: CTR-2024-0001 -> Contract #2024-0001
    return contractNumber.replace('CTR-', 'Contract #');
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.error?.code) {
      const errorCode = error.response.data.error.code as ContractErrorCode;
      const message = this.getErrorMessage(errorCode);
      return new Error(message);
    }
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    return new Error('An unexpected error occurred');
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(code: ContractErrorCode): string {
    switch (code) {
      case ContractErrorCode.CONTRACT_NOT_FOUND:
        return 'Contract not found';
      case ContractErrorCode.CONTRACT_ACCESS_DENIED:
        return 'You do not have permission to access this contract';
      case ContractErrorCode.CONTRACT_INVALID_STATUS:
        return 'This operation is not allowed in the current contract status';
      case ContractErrorCode.CONTRACT_VALIDATION_ERROR:
        return 'Please check your input and try again';
      case ContractErrorCode.CONTRACT_ALREADY_APPROVED:
        return 'Your team has already approved this contract';
      case ContractErrorCode.CONTRACT_ALREADY_REJECTED:
        return 'This contract has already been rejected';
      case ContractErrorCode.TEAM_NOT_FOUND:
        return 'One or more selected teams were not found';
      case ContractErrorCode.TEAM_NOT_IN_ACTIVITY:
        return 'All teams must be in the same activity';
      case ContractErrorCode.CONTRACT_LIMIT_EXCEEDED:
        return 'Team contract limit has been reached';
      case ContractErrorCode.UNAUTHORIZED_ROLE:
        return 'You must be a Student in a team to perform this action';
      default:
        return 'An error occurred while processing your request';
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();

// Export types for convenience
export type { 
  Contract,
  CreateContractRequest,
  ContractListRequest,
  ContractDetailsResponse,
  ContractHistoryResponse
};

export { ContractStatus, ContractOperationType } from '@/types/contract';