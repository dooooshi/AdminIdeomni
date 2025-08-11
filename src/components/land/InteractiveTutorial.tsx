'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Fab,
  Popover,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Zoom,
  Fade,
  keyframes
} from '@mui/material';
import {
  School as TutorialIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as RestartIcon,
  Lightbulb as TipIcon,
  TouchApp as TouchIcon,
  Visibility as LookIcon,
  ShoppingCart as PurchaseIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const TutorialFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1400,
  animation: `${pulseAnimation} 2s infinite`,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  },
}));

const TutorialCard = styled(Card)(({ theme }) => ({
  maxWidth: 320,
  minWidth: 280,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[16],
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const HighlightOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  border: `3px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
  background: `${theme.palette.primary.main}20`,
  animation: `${pulseAnimation} 1.5s infinite`,
  zIndex: 1350,
  pointerEvents: 'none',
}));

const SpotlightOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  zIndex: 1300,
  pointerEvents: 'none',
}));

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string;
  targetPosition?: { x: number; y: number; width: number; height: number };
  action: 'hover' | 'click' | 'observe' | 'wait';
  icon: React.ReactNode;
  tip?: string;
  skipable?: boolean;
}

interface InteractiveTutorialProps {
  autoStart?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  autoStart = false,
  onComplete,
  onSkip
}) => {
  const { t } = useTranslation('landManagement');
  const theme = useTheme();
  
  // Tutorial state
  const [isActive, setIsActive] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [highlightPosition, setHighlightPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Refs
  const tutorialRef = useRef<HTMLDivElement>(null);

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: t('TUTORIAL_WELCOME_TITLE'),
      content: t('TUTORIAL_WELCOME_CONTENT'),
      action: 'observe',
      icon: <TutorialIcon />,
      tip: t('TUTORIAL_WELCOME_TIP')
    },
    {
      id: 'explore-map',
      title: 'Explore the Map 🗺️',
      content: 'Hover over different tiles on the map to see instant previews with pricing and availability information.',
      targetSelector: '.hexagonal-map',
      action: 'hover',
      icon: <LookIcon />,
      tip: 'Each color represents different land types: Green for Plains, Blue for Coastal, and Dark Blue for Marine territories.'
    },
    {
      id: 'tile-preview',
      title: 'Tile Information Cards 📋',
      content: 'When you hover over a tile, you\'ll see a preview card with detailed information including current prices, ownership status, and quick actions.',
      action: 'hover',
      icon: <TouchIcon />,
      tip: 'Preview cards automatically position themselves to stay visible on screen.'
    },
    {
      id: 'quick-actions',
      title: 'Quick Purchase Actions ⚡',
      content: 'Use the quick action buttons on preview cards for common operations like quick purchase (1 unit) or opening the full purchase panel.',
      action: 'observe',
      icon: <PurchaseIcon />,
      tip: 'Quick actions save time for simple purchases.'
    },
    {
      id: 'select-tile',
      title: 'Select a Tile 🎯',
      content: 'Click on any available tile (shown in green) to select it and see more detailed information in the bottom panel.',
      targetSelector: '.hex-tile[data-available="true"]',
      action: 'click',
      icon: <TouchIcon />,
      tip: 'Available tiles are highlighted with bright colors and have clear purchase indicators.'
    },
    {
      id: 'tile-info-panel',
      title: 'Detailed Tile Information 📊',
      content: 'The bottom panel shows comprehensive tile details including current pricing, your team\'s existing ownership, and available area.',
      targetSelector: '.tile-info-panel',
      action: 'observe',
      icon: <LookIcon />,
      tip: 'This panel updates automatically when you select different tiles.'
    },
    {
      id: 'purchase-button',
      title: 'Start a Purchase 💰',
      content: 'Click the "Purchase Land" button to open the enhanced purchase panel with real-time cost calculations.',
      targetSelector: '.purchase-button',
      action: 'click',
      icon: <PurchaseIcon />,
      tip: 'The enhanced purchase panel replaces old-style popup windows for a smoother experience.'
    },
    {
      id: 'purchase-panel',
      title: 'Enhanced Purchase Panel ✨',
      content: 'The sliding purchase panel offers real-time cost calculations, affordability indicators, and advanced options like price protection.',
      action: 'observe',
      icon: <PurchaseIcon />,
      tip: 'All calculations update instantly as you adjust the purchase amount.'
    },
    {
      id: 'cost-calculator',
      title: 'Real-time Cost Calculator 🧮',
      content: 'Watch how costs update in real-time as you adjust the area slider. The visual indicators show how much of your team\'s resources will be used.',
      action: 'observe',
      icon: <TouchIcon />,
      tip: 'Green indicators mean you can afford it, yellow means caution, and red means insufficient resources.'
    },
    {
      id: 'quick-presets',
      title: 'Quick Purchase Presets 🚀',
      content: 'Use the preset buttons (1, 5, 10 units) for common purchase amounts, or use the slider for custom amounts.',
      action: 'observe',
      icon: <TouchIcon />,
      tip: 'Presets are great for quick decisions, while the slider gives you precise control.'
    },
    {
      id: 'advanced-options',
      title: 'Advanced Options ⚙️',
      content: 'Expand the advanced options to set price protection limits and add purchase descriptions for better record-keeping.',
      action: 'observe',
      icon: <TouchIcon />,
      tip: 'Price protection prevents surprise cost increases between validation and purchase.'
    },
    {
      id: 'team-stats',
      title: 'Team Statistics 📈',
      content: 'Keep an eye on your team\'s statistics in the top cards showing total owned area, spending, and available tiles.',
      targetSelector: '.team-stats',
      action: 'observe',
      icon: <LookIcon />,
      tip: 'These stats help you make informed decisions about your land portfolio.'
    },
    {
      id: 'bulk-mode',
      title: 'Bulk Purchase Mode 🎯',
      content: 'For advanced users: Use the bulk selection mode to purchase multiple tiles at once for efficient portfolio expansion.',
      action: 'observe',
      icon: <TouchIcon />,
      tip: 'Bulk mode is perfect for implementing larger strategic land acquisition plans.'
    },
    {
      id: 'completion',
      title: 'Tutorial Complete! 🎉',
      content: 'You\'re now ready to start building your land empire! Remember, you can always access help through the interface or restart this tutorial.',
      action: 'observe',
      icon: <CheckIcon />,
      tip: 'Happy land purchasing! 🏞️'
    }
  ];

  // Handle tutorial progression
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      updateHighlight(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateHighlight(currentStep - 1);
    }
  };

  const updateHighlight = (stepIndex: number) => {
    const step = tutorialSteps[stepIndex];
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightPosition({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        });
        setAnchorEl(element);
      } else {
        setHighlightPosition(null);
        setAnchorEl(null);
      }
    } else {
      setHighlightPosition(null);
      setAnchorEl(null);
    }
  };

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
    setCompleted(false);
    updateHighlight(0);
  };

  const completeTutorial = () => {
    setCompleted(true);
    setIsActive(false);
    setHighlightPosition(null);
    setAnchorEl(null);
    onComplete?.();
  };

  const skipTutorial = () => {
    setIsActive(false);
    setHighlightPosition(null);
    setAnchorEl(null);
    onSkip?.();
  };

  const pauseResumeTutorial = () => {
    setIsPaused(!isPaused);
  };

  // Auto-advance for observation steps
  useEffect(() => {
    if (isActive && !isPaused && tutorialSteps[currentStep]?.action === 'wait') {
      const timer = setTimeout(() => {
        nextStep();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isActive, isPaused]);

  // Update highlight when step changes
  useEffect(() => {
    if (isActive) {
      updateHighlight(currentStep);
    }
  }, [currentStep, isActive]);

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <>
      {/* Tutorial Trigger Fab */}
      {!isActive && !completed && (
        <Zoom in timeout={500}>
          <TutorialFab
            color="primary"
            onClick={startTutorial}
            sx={{
              animation: `${bounceAnimation} 2s infinite`,
            }}
          >
            <TutorialIcon />
          </TutorialFab>
        </Zoom>
      )}

      {/* Spotlight Overlay */}
      {isActive && (
        <Fade in timeout={300}>
          <SpotlightOverlay />
        </Fade>
      )}

      {/* Highlight Box */}
      {isActive && highlightPosition && (
        <Zoom in timeout={200}>
          <HighlightOverlay
            style={{
              left: highlightPosition.x - 5,
              top: highlightPosition.y - 5,
              width: highlightPosition.width + 10,
              height: highlightPosition.height + 10,
            }}
          />
        </Zoom>
      )}

      {/* Tutorial Popover */}
      {isActive && (
        <Popover
          open={isActive}
          anchorEl={anchorEl || document.body}
          anchorOrigin={{
            vertical: anchorEl ? 'bottom' : 'center',
            horizontal: anchorEl ? 'center' : 'center',
          }}
          transformOrigin={{
            vertical: anchorEl ? 'top' : 'center',
            horizontal: anchorEl ? 'center' : 'center',
          }}
          PaperProps={{
            sx: { background: 'transparent', boxShadow: 'none' }
          }}
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
        >
          <Zoom in timeout={300}>
            <TutorialCard ref={tutorialRef}>
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {currentStepData.icon}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {currentStepData.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('TUTORIAL_STEP', { current: currentStep + 1, total: tutorialSteps.length })}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <Tooltip title={isPaused ? t('RESUME') : t('PAUSE')}>
                      <IconButton size="small" onClick={pauseResumeTutorial}>
                        {isPaused ? <PlayIcon /> : <PauseIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('SKIP_TUTORIAL')}>
                      <IconButton size="small" onClick={skipTutorial}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Progress */}
                <Box mb={2}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {t('TUTORIAL_PROGRESS', { progress: Math.round(progress) })}
                  </Typography>
                </Box>

                {/* Content */}
                <Typography variant="body2" paragraph>
                  {currentStepData.content}
                </Typography>

                {/* Tip */}
                {currentStepData.tip && (
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'info.light',
                      color: 'info.contrastText',
                      borderRadius: 1,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <TipIcon sx={{ fontSize: '1rem', mt: 0.25 }} />
                    <Typography variant="body2">
                      {currentStepData.tip}
                    </Typography>
                  </Box>
                )}

                {/* Action Indicator */}
                {currentStepData.action !== 'observe' && (
                  <Chip
                    icon={currentStepData.action === 'hover' ? <LookIcon /> : <TouchIcon />}
                    label={currentStepData.action === 'hover' ? t('HOVER_TO_CONTINUE') : t('CLICK_TO_CONTINUE')}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Navigation */}
                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                  <Button
                    disabled={currentStep === 0}
                    onClick={prevStep}
                    startIcon={<BackIcon />}
                    size="small"
                  >
                    {t('BACK')}
                  </Button>

                  <Stack direction="row" spacing={1}>
                    {tutorialSteps.map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: index === currentStep 
                            ? 'primary.main' 
                            : index < currentStep 
                            ? 'success.main' 
                            : 'grey.300',
                          transition: 'all 0.3s ease-in-out'
                        }}
                      />
                    ))}
                  </Stack>

                  {currentStep === tutorialSteps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={completeTutorial}
                      startIcon={<CheckIcon />}
                      size="small"
                    >
                      {t('COMPLETE')}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={nextStep}
                      endIcon={<NextIcon />}
                      size="small"
                      disabled={currentStepData.action !== 'observe' && currentStepData.action !== 'wait'}
                    >
                      {t('NEXT')}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </TutorialCard>
          </Zoom>
        </Popover>
      )}

      {/* Restart Tutorial Option */}
      {completed && (
        <Tooltip title={t('RESTART_TUTORIAL')}>
          <Fab
            color="primary"
            size="small"
            onClick={startTutorial}
            sx={{
              position: 'fixed',
              bottom: theme.spacing(3),
              right: theme.spacing(3),
              zIndex: 1400,
            }}
          >
            <RestartIcon />
          </Fab>
        </Tooltip>
      )}
    </>
  );
};

export default InteractiveTutorial;