import React, { useEffect, useState } from 'react';
import { Box, Fade, Zoom, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as CheckIcon,
  Stars as StarsIcon,
  LocalAtm as MoneyIcon,
  Landscape as LandIcon
} from '@mui/icons-material';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const sparkleAnimation = keyframes`
  0% {
    transform: rotate(0deg) scale(0);
    opacity: 0;
  }
  50% {
    transform: rotate(180deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: rotate(360deg) scale(0);
    opacity: 0;
  }
`;

const slideUpAnimation = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const AnimationContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 9999,
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const MainIcon = styled(CheckIcon)(({ theme }) => ({
  fontSize: '4rem',
  color: theme.palette.success.main,
  animation: `${pulseAnimation} 1s ease-in-out`,
  filter: 'drop-shadow(0 4px 12px rgba(76, 175, 80, 0.3))',
}));

const SparkleIcon = styled(StarsIcon)<{ delay: number }>(({ theme, delay }) => ({
  position: 'absolute',
  fontSize: '1.5rem',
  color: theme.palette.warning.main,
  animation: `${sparkleAnimation} 2s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const AnimatedText = styled(Box)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: theme.palette.success.main,
  textAlign: 'center',
  animation: `${slideUpAnimation} 0.8s ease-out 0.3s both`,
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const SecondaryText = styled(Box)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  animation: `${slideUpAnimation} 0.8s ease-out 0.6s both`,
  maxWidth: '300px',
}));

const FloatingIcon = styled(Box)<{ coordinates: { x: number; y: number } }>(
  ({ theme, coordinates }) => ({
    position: 'absolute',
    left: coordinates.x,
    top: coordinates.y,
    animation: `${sparkleAnimation} 1.5s ease-in-out`,
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
      color: theme.palette.primary.main,
    },
  })
);

interface PurchaseSuccessAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  purchaseData?: {
    tileId: number;
    area: number;
    cost: number;
    landType: string;
  };
  duration?: number;
}

const PurchaseSuccessAnimation: React.FC<PurchaseSuccessAnimationProps> = ({
  isVisible,
  onComplete,
  purchaseData,
  duration = 3000,
}) => {
  const [showSparkles, setShowSparkles] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState<Array<{ id: number; x: number; y: number; icon: React.ReactNode }>>([]);

  useEffect(() => {
    if (!isVisible) return;

    // Show sparkles after a short delay
    const sparkleTimer = setTimeout(() => {
      setShowSparkles(true);
    }, 500);

    // Create floating icons
    const iconTimer = setTimeout(() => {
      const icons = [
        { id: 1, x: -60, y: -40, icon: <MoneyIcon /> },
        { id: 2, x: 60, y: -20, icon: <LandIcon /> },
        { id: 3, x: -40, y: 40, icon: <StarsIcon /> },
        { id: 4, x: 80, y: 30, icon: <CheckIcon /> },
      ];
      setFloatingIcons(icons);
    }, 800);

    // Hide animation after duration
    const hideTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(sparkleTimer);
      clearTimeout(iconTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <Fade in={isVisible} timeout={500}>
      <AnimationContainer>
        {/* Main success icon with sparkles */}
        <Box position="relative">
          <Zoom in={isVisible} timeout={600} style={{ transitionDelay: '200ms' }}>
            <div>
              <MainIcon />
            </div>
          </Zoom>
          
          {/* Sparkle effects */}
          {showSparkles && (
            <>
              <SparkleIcon delay={0} style={{ top: -10, left: -15 }} />
              <SparkleIcon delay={0.3} style={{ top: -5, right: -20 }} />
              <SparkleIcon delay={0.6} style={{ bottom: -10, left: -10 }} />
              <SparkleIcon delay={0.9} style={{ bottom: -5, right: -15 }} />
            </>
          )}
          
          {/* Floating icons */}
          {floatingIcons.map((icon) => (
            <FloatingIcon key={icon.id} coordinates={{ x: icon.x, y: icon.y }}>
              {icon.icon}
            </FloatingIcon>
          ))}
        </Box>

        {/* Success text */}
        <AnimatedText>
          🎉 Purchase Successful!
        </AnimatedText>
        
        {purchaseData && (
          <SecondaryText>
            Acquired {purchaseData.area} area on {purchaseData.landType} tile {purchaseData.tileId}
            <br />
            Total cost: ${purchaseData.cost.toLocaleString()}
          </SecondaryText>
        )}
      </AnimationContainer>
    </Fade>
  );
};

export default PurchaseSuccessAnimation;