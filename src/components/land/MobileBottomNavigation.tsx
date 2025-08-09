'use client';

import React from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme
} from '@mui/material';
import {
  Map as MapIcon,
  FilterList as FilterIcon,
  GroupWork as BulkIcon,
  Psychology as AIIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetZoomIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  ShoppingCart as PurchaseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTranslation } from '@/@i18n/hooks/useTranslation';

const MobileBottomNav = styled(BottomNavigation)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  borderTop: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(135deg, ${theme.palette.background.paper}f8 0%, ${theme.palette.grey[50]}f8 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiBottomNavigationAction-root': {
    minWidth: 'auto',
    padding: theme.spacing(0.5, 1),
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
  [theme.breakpoints.up('md')]: {
    display: 'none', // Hide on desktop
  },
}));

const QuickActionsSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'fixed',
  bottom: 80, // Above bottom navigation
  right: 16,
  zIndex: 1100,
  '& .MuiSpeedDial-fab': {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: theme.palette.primary.contrastText,
    width: 48,
    height: 48,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    },
  },
  '& .MuiSpeedDialAction-fab': {
    width: 40,
    height: 40,
    margin: theme.spacing(0.5, 0),
  },
  [theme.breakpoints.up('md')]: {
    display: 'none', // Hide on desktop
  },
}));

interface MobileBottomNavigationProps {
  selectedTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  bulkMode: boolean;
  selectedTilesCount: number;
  onBulkModeToggle: () => void;
  onAIAssistantOpen: () => void;
  onFiltersOpen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onRefresh: () => void;
  onClearSelection: () => void;
  onBulkPurchase: () => void;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  selectedTab,
  onTabChange,
  bulkMode,
  selectedTilesCount,
  onBulkModeToggle,
  onAIAssistantOpen,
  onFiltersOpen,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onRefresh,
  onClearSelection,
  onBulkPurchase
}) => {
  const { t } = useTranslation(['landManagement', 'common']);
  const theme = useTheme();
  const [speedDialOpen, setSpeedDialOpen] = React.useState(false);

  const handleSpeedDialToggle = () => {
    setSpeedDialOpen(!speedDialOpen);
  };

  const handleSpeedDialClose = () => {
    setSpeedDialOpen(false);
  };

  const speedDialActions = [
    {
      icon: <ZoomInIcon />,
      name: 'Zoom In',
      onClick: () => {
        onZoomIn();
        handleSpeedDialClose();
      },
    },
    {
      icon: <ZoomOutIcon />,
      name: 'Zoom Out',
      onClick: () => {
        onZoomOut();
        handleSpeedDialClose();
      },
    },
    {
      icon: <ResetZoomIcon />,
      name: 'Reset Zoom',
      onClick: () => {
        onResetZoom();
        handleSpeedDialClose();
      },
    },
    {
      icon: <RefreshIcon />,
      name: 'Refresh',
      onClick: () => {
        onRefresh();
        handleSpeedDialClose();
      },
    },
  ];

  // Add bulk mode specific actions
  if (bulkMode && selectedTilesCount > 0) {
    speedDialActions.unshift(
      {
        icon: <PurchaseIcon />,
        name: 'Bulk Purchase',
        onClick: () => {
          onBulkPurchase();
          handleSpeedDialClose();
        },
      },
      {
        icon: <ClearIcon />,
        name: 'Clear Selection',
        onClick: () => {
          onClearSelection();
          handleSpeedDialClose();
        },
      }
    );
  }

  return (
    <>
      <MobileBottomNav
        value={selectedTab}
        onChange={onTabChange}
        showLabels
      >
        <BottomNavigationAction
          label="Map"
          icon={<MapIcon />}
        />
        
        <BottomNavigationAction
          label="Filters"
          icon={<FilterIcon />}
          onClick={onFiltersOpen}
        />
        
        <BottomNavigationAction
          label={bulkMode ? t('landManagement:EXIT_BULK') : t('landManagement:BULK_MODE')}
          icon={
            <Badge 
              badgeContent={bulkMode ? selectedTilesCount : 0} 
              color="primary"
              max={99}
            >
              <BulkIcon />
            </Badge>
          }
          onClick={onBulkModeToggle}
          sx={{
            color: bulkMode ? theme.palette.primary.main : 'inherit',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          }}
        />
        
        <BottomNavigationAction
          label="AI Assistant"
          icon={<AIIcon />}
          onClick={onAIAssistantOpen}
        />
      </MobileBottomNav>

      {/* Quick Actions Speed Dial */}
      <QuickActionsSpeedDial
        ariaLabel="Quick map actions"
        icon={<SpeedDialIcon />}
        onClose={handleSpeedDialClose}
        onOpen={handleSpeedDialToggle}
        open={speedDialOpen}
        direction="up"
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </QuickActionsSpeedDial>
    </>
  );
};

export default MobileBottomNavigation;