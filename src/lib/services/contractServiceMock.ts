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
  ContractOperationType
} from '@/types/contract';

// Mock data for demonstration
const mockContracts: Contract[] = [
  {
    contractId: 'CTR-2025-0001',
    contractNumber: 'CTR-2025-0001',
    title: 'Strategic Alliance for Resource Sharing',
    content: 'This contract establishes a strategic alliance between Team A and Team B for the purpose of sharing carbon credits and gold resources. Both teams agree to contribute equally to joint operations and share profits based on the agreed percentage split of 50-50.',
    status: ContractStatus.PENDING_APPROVAL,
    creatorTeamId: 'team-001',
    teams: [
      {
        teamId: 'cmfhgnsu80032fym960r2c375',
        teamName: 'Team B',
        approved: false,
        approvedAt: null,
        approvedBy: null
      },
      {
        teamId: 'team-002',
        teamName: 'Team C',
        approved: true,
        approvedAt: '2025-01-10T14:30:00Z',
        approvedBy: 'user-002'
      }
    ],
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
    deletedAt: null,
    createdBy: 'user-001',
    updatedBy: 'user-002',
    deletedBy: null
  },
  {
    contractId: 'CTR-2025-0002',
    contractNumber: 'CTR-2025-0002',
    title: 'Joint Development Agreement for Northern Territory',
    content: 'This agreement outlines the terms for joint development of facilities in the Northern Territory. All participating teams will share costs and revenues proportionally based on their investment percentage.',
    status: ContractStatus.SIGNED,
    creatorTeamId: 'team-003',
    teams: [
      {
        teamId: 'cmfhgnsu80032fym960r2c375',
        teamName: 'Team B',
        approved: true,
        approvedAt: '2025-01-09T09:00:00Z',
        approvedBy: 'cmfhgnski002pfym9vvvqfc99'
      },
      {
        teamId: 'team-003',
        teamName: 'Team D',
        approved: true,
        approvedAt: '2025-01-09T09:30:00Z',
        approvedBy: 'user-003'
      },
      {
        teamId: 'team-004',
        teamName: 'Team E',
        approved: true,
        approvedAt: '2025-01-09T10:00:00Z',
        approvedBy: 'user-004'
      }
    ],
    createdAt: '2025-01-08T15:00:00Z',
    updatedAt: '2025-01-09T10:00:00Z',
    deletedAt: null,
    createdBy: 'user-003',
    updatedBy: 'user-004',
    deletedBy: null
  },
  {
    contractId: 'CTR-2025-0003',
    contractNumber: 'CTR-2025-0003',
    title: 'Technology Transfer and Licensing Agreement',
    content: 'This contract governs the transfer of advanced facility upgrade technology between teams. The receiving team agrees to pay royalties based on production output.',
    status: ContractStatus.REJECTED,
    creatorTeamId: 'team-005',
    teams: [
      {
        teamId: 'cmfhgnsu80032fym960r2c375',
        teamName: 'Team B',
        approved: false,
        approvedAt: null,
        approvedBy: null
      },
      {
        teamId: 'team-005',
        teamName: 'Team F',
        approved: true,
        approvedAt: '2025-01-07T11:00:00Z',
        approvedBy: 'user-005'
      }
    ],
    createdAt: '2025-01-07T08:00:00Z',
    updatedAt: '2025-01-07T16:00:00Z',
    deletedAt: null,
    createdBy: 'user-005',
    updatedBy: 'user-006',
    deletedBy: null
  }
];

const mockAvailableTeams = [
  { teamId: 'team-002', teamName: 'Team C', memberCount: 5 },
  { teamId: 'team-003', teamName: 'Team D', memberCount: 4 },
  { teamId: 'team-004', teamName: 'Team E', memberCount: 6 },
  { teamId: 'team-005', teamName: 'Team F', memberCount: 3 },
  { teamId: 'team-006', teamName: 'Team G', memberCount: 5 },
  { teamId: 'team-007', teamName: 'Team H', memberCount: 4 }
];

// Mock Contract Service - For demonstration when backend is not available
class ContractServiceMock {
  private readonly baseUrl = '/contract';
  private contracts: Contract[] = [...mockContracts];
  private nextContractNumber = 4;

  async createContract(data: CreateContractRequest): Promise<CreateContractResponse> {
    const contractNumber = `CTR-2025-${String(this.nextContractNumber++).padStart(4, '0')}`;
    const newContract: Contract = {
      contractId: contractNumber,
      contractNumber,
      title: data.title,
      content: data.content,
      status: ContractStatus.PENDING_APPROVAL,
      creatorTeamId: 'cmfhgnsu80032fym960r2c375', // Current user's team
      teams: [
        {
          teamId: 'cmfhgnsu80032fym960r2c375',
          teamName: 'Team B',
          approved: true, // Creator team auto-approves
          approvedAt: new Date().toISOString(),
          approvedBy: 'cmfhgnski002pfym9vvvqfc99'
        },
        ...data.teamIds.map(teamId => {
          const team = mockAvailableTeams.find(t => t.teamId === teamId);
          return {
            teamId,
            teamName: team?.teamName || 'Unknown Team',
            approved: false,
            approvedAt: null,
            approvedBy: null
          };
        })
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: 'cmfhgnski002pfym9vvvqfc99',
      updatedBy: 'cmfhgnski002pfym9vvvqfc99',
      deletedBy: null
    };

    this.contracts.unshift(newContract);

    return {
      contract: newContract,
      message: 'Contract created successfully'
    };
  }

  async listContracts(params?: ContractListRequest): Promise<ContractListResponse> {
    let filtered = [...this.contracts];

    // Filter by status
    if (params?.status) {
      filtered = filtered.filter(c => c.status === params.status);
    }

    // Filter by team - show contracts where user's team is involved
    const userTeamId = 'cmfhgnsu80032fym960r2c375';
    filtered = filtered.filter(c => 
      c.creatorTeamId === userTeamId || 
      c.teams.some(t => t.teamId === userTeamId)
    );

    // Filter out deleted if not requested
    if (!params?.includeDeleted) {
      filtered = filtered.filter(c => !c.deletedAt);
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      contracts: paginated.map(c => ({
        contractId: c.contractId,
        contractNumber: c.contractNumber,
        title: c.title,
        status: c.status,
        teamCount: c.teams.length,
        teams: c.teams.map(t => ({
          teamId: t.teamId,
          teamName: t.teamName,
          approved: t.approved || false
        })),
        createdBy: c.createdBy ? {
          userId: c.createdBy,
          username: c.createdBy === 'cmfhgnski002pfym9vvvqfc99' ? '333' : 'user',
          firstName: c.createdBy === 'cmfhgnski002pfym9vvvqfc99' ? 'Sarah' : 'Unknown',
          lastName: c.createdBy === 'cmfhgnski002pfym9vvvqfc99' ? 'Liu' : 'User'
        } : undefined,
        createdAt: c.createdAt,
        signedAt: c.status === ContractStatus.SIGNED ? c.updatedAt : null,
        rejectedAt: c.status === ContractStatus.REJECTED ? c.updatedAt : null
      })),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit)
      }
    };
  }

  async getContractDetails(contractId: string): Promise<ContractDetailsResponse> {
    const contract = this.contracts.find(c => c.contractId === contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    return contract;
  }

  async approveContract(contractId: string): Promise<ApproveContractResponse> {
    const contract = this.contracts.find(c => c.contractId === contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const userTeamId = 'cmfhgnsu80032fym960r2c375';
    const team = contract.teams.find(t => t.teamId === userTeamId);
    if (!team) {
      throw new Error('Your team is not part of this contract');
    }

    if (team.approved) {
      throw new Error('Your team has already approved this contract');
    }

    // Update team approval
    team.approved = true;
    team.approvedAt = new Date().toISOString();
    team.approvedBy = 'cmfhgnski002pfym9vvvqfc99';

    // Check if all teams have approved
    const allApproved = contract.teams.every(t => t.approved);
    if (allApproved) {
      contract.status = ContractStatus.SIGNED;
    }

    contract.updatedAt = new Date().toISOString();
    contract.updatedBy = 'cmfhgnski002pfym9vvvqfc99';

    return {
      contract,
      message: allApproved ? 'Contract has been signed by all teams' : 'Contract approved by your team'
    };
  }

  async rejectContract(contractId: string): Promise<RejectContractResponse> {
    const contract = this.contracts.find(c => c.contractId === contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const userTeamId = 'cmfhgnsu80032fym960r2c375';
    const team = contract.teams.find(t => t.teamId === userTeamId);
    if (!team) {
      throw new Error('Your team is not part of this contract');
    }

    contract.status = ContractStatus.REJECTED;
    contract.updatedAt = new Date().toISOString();
    contract.updatedBy = 'cmfhgnski002pfym9vvvqfc99';

    return {
      contract,
      message: 'Contract has been rejected'
    };
  }

  async getAvailableTeams(): Promise<AvailableTeamsResponse> {
    return {
      teams: mockAvailableTeams
    };
  }

  async getContractHistory(params: ContractHistoryRequest): Promise<ContractHistoryResponse> {
    const contract = this.contracts.find(c => c.contractId === params.contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const history = [
      {
        historyId: 'hist-001',
        contractId: params.contractId,
        operationType: ContractOperationType.CREATED,
        operatorId: contract.createdBy!,
        operatorName: 'Sarah Liu',
        teamId: contract.creatorTeamId,
        teamName: 'Team B',
        details: { title: contract.title },
        createdAt: contract.createdAt
      }
    ];

    // Add approval history
    contract.teams.forEach((team, index) => {
      if (team.approved && team.approvedAt) {
        history.push({
          historyId: `hist-00${index + 2}`,
          contractId: params.contractId,
          operationType: ContractOperationType.APPROVED,
          operatorId: team.approvedBy!,
          operatorName: `User from ${team.teamName}`,
          teamId: team.teamId,
          teamName: team.teamName,
          details: {},
          createdAt: team.approvedAt
        });
      }
    });

    // Add status change history
    if (contract.status === ContractStatus.SIGNED) {
      history.push({
        historyId: `hist-final`,
        contractId: params.contractId,
        operationType: ContractOperationType.STATUS_CHANGED,
        operatorId: 'system',
        operatorName: 'System',
        teamId: null,
        teamName: null,
        details: { 
          oldStatus: ContractStatus.PENDING_APPROVAL,
          newStatus: ContractStatus.SIGNED 
        },
        createdAt: contract.updatedAt
      });
    } else if (contract.status === ContractStatus.REJECTED) {
      history.push({
        historyId: `hist-reject`,
        contractId: params.contractId,
        operationType: ContractOperationType.REJECTED,
        operatorId: contract.updatedBy!,
        operatorName: 'Sarah Liu',
        teamId: 'cmfhgnsu80032fym960r2c375',
        teamName: 'Team B',
        details: {},
        createdAt: contract.updatedAt
      });
    }

    // Sort by date descending
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params.page || 1;
    const limit = params.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      history: history.slice(start, end),
      pagination: {
        page,
        limit,
        total: history.length,
        totalPages: Math.ceil(history.length / limit)
      }
    };
  }

  // Validation methods (same as real service)
  validateContractData(data: CreateContractRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.length < 10) {
      errors.push('Title must be at least 10 characters long');
    }
    if (data.title && data.title.length > 200) {
      errors.push('Title must not exceed 200 characters');
    }

    if (!data.content || data.content.length < 50) {
      errors.push('Content must be at least 50 characters long');
    }
    if (data.content && data.content.length > 10000) {
      errors.push('Content must not exceed 10000 characters');
    }

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

  canApprove(contract: ContractDetailsResponse, userTeamId: string): boolean {
    if (contract.status !== ContractStatus.PENDING_APPROVAL) {
      return false;
    }
    const userTeam = contract.teams.find(t => t.teamId === userTeamId);
    if (!userTeam) {
      return false;
    }
    return !userTeam.approved;
  }

  canReject(contract: ContractDetailsResponse, userTeamId: string): boolean {
    if (contract.status !== ContractStatus.PENDING_APPROVAL) {
      return false;
    }
    const userTeam = contract.teams.find(t => t.teamId === userTeamId);
    return !!userTeam;
  }

  formatContractNumber(contractNumber: string): string {
    return contractNumber.replace('CTR-', 'Contract #');
  }
}

// Export singleton instance
export const contractServiceMock = new ContractServiceMock();

export { ContractStatus, ContractOperationType } from '@/types/contract';