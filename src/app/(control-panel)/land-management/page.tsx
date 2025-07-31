'use client';

import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Container,
  Chip,
  IconButton,
  Paper,
  Avatar,
  Divider,
  Stack
} from '@mui/material';
import { 
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  AccountBalance as PortfolioIcon,
  ShoppingCart as PurchaseIcon,
  TrendingUp as InvestIcon,
  Explore as ExploreIcon,
  Terrain as TerrainIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Landscape as LandscapeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { styled, useTheme } from '@mui/material/styles';

// Styled components for modern design
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.secondary.main}15 50%, 
    ${theme.palette.success.main}15 100%
  )`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(6, 4),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${theme.palette.primary.main.replace('#', '')}' fill-opacity='0.03'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-2c9.943 0 18-8.057 18-18s-8.057-18-18-18V0c11.046 0 20 8.954 20 20zM0 38.59l2-2 1.41 1.41L1.41 40H0v-1.41z'/%3E%3C/g%3E%3C/svg%3E") repeat`,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `2px solid transparent`,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[16],
    borderColor: theme.palette.primary.light,
    '&::before': {
      transform: 'scaleX(1)',
    },
  },
}));

const GlowingButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 4),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
    transition: 'left 0.5s ease',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  fontWeight: 600,
  '& .MuiChip-avatar': {
    width: 24,
    height: 24,
  },
}));

/**
 * Land Management Hub Page
 * Modern, visually appealing navigation hub for land management features
 */
const LandManagementPage: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();

  // Mock statistics - in real app, fetch from API
  const stats = {
    availableLands: 1247,
    totalInvestors: 342,
    avgROI: 15.6,
    marketValue: 2.8
  };
  
  const managerOptions = [
    {
      title: 'Manager Map View',
      description: 'Interactive map showing land ownership across all teams',
      icon: <MapIcon fontSize="large" />,
      path: '/land-management/manager/map',
      color: 'primary'
    },
    {
      title: 'Manager Overview',
      description: 'Comprehensive overview of land activities and team performance',
      icon: <DashboardIcon fontSize="large" />,
      path: '/land-management/manager/overview',
      color: 'secondary'
    },
    {
      title: 'Manager Analytics',
      description: 'Detailed analytics and insights for land management',
      icon: <AnalyticsIcon fontSize="large" />,
      path: '/land-management/manager/analytics',
      color: 'success'
    }
  ];

  const purchaseOptions = [
    {
      title: 'Land Explorer',
      description: 'Interactive map to discover and purchase premium land opportunities',
      icon: <ExploreIcon fontSize="large" />,
      path: '/land-management/student/map',
      color: 'primary',
      featured: true
    },
    {
      title: 'Quick Purchase',
      description: 'Fast-track land acquisition with smart recommendations',
      icon: <PurchaseIcon fontSize="large" />,
      path: '/land-management/student/map?mode=quick',
      color: 'success',
      featured: true
    },
    {
      title: 'Investment Portfolio',
      description: 'Track your land investments and manage your holdings',
      icon: <InvestIcon fontSize="large" />,
      path: '/land-management/student/portfolio',
      color: 'warning',
      featured: false
    },
    {
      title: 'Market Analysis',
      description: 'Analyze market trends and land values for better decisions',
      icon: <AnalyticsIcon fontSize="large" />,
      path: '/land-management/student/portfolio?tab=analytics',
      color: 'info',
      featured: false
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <HeroSection>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Box>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                  }}
                >
                  🌍 Land Empire
                </Typography>
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  sx={{ 
                    fontWeight: 400,
                    lineHeight: 1.4,
                    mb: 3
                  }}
                >
                  Discover premium land opportunities, build strategic portfolios, and maximize your investment potential in our digital landscape.
                </Typography>
              </Box>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <StatsChip 
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><TerrainIcon /></Avatar>}
                  label={`${stats.availableLands.toLocaleString()} Available Lands`}
                  color="success"
                  variant="filled"
                />
                <StatsChip 
                  avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><InvestIcon /></Avatar>}
                  label={`${stats.totalInvestors} Active Investors`}
                  color="primary"
                  variant="filled"
                />
                <StatsChip 
                  avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><TrendingUpIcon /></Avatar>}
                  label={`${stats.avgROI}% Avg ROI`}
                  color="warning"
                  variant="filled"
                />
              </Stack>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'spin 20s linear infinite',
                  '@keyframes spin': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' }
                  }
                }}
              >
                <Box
                  sx={{
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem'
                  }}
                >
                  🏢
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </HeroSection>

      {/* Manager Interface Section */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <DashboardIcon />
            </Avatar>
            Manager Command Center
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Advanced analytics and oversight tools for administrators to monitor and manage land activities.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {managerOptions.map((option, index) => (
            <Grid item xs={12} md={4} key={option.path}>
              <FeatureCard onClick={() => router.push(option.path)}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${option.color}.main`,
                        width: 64,
                        height: 64,
                        mb: 2
                      }}
                    >
                      {option.icon}
                    </Avatar>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                      {option.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {option.description}
                    </Typography>
                  </Box>
                  
                  <GlowingButton 
                    variant="contained" 
                    color={option.color as any}
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(option.path);
                    }}
                  >
                    Launch Dashboard
                  </GlowingButton>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Investment Tools */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2
            }}
          >
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <StarIcon />
            </Avatar>
            Premium Investment Suite
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Professional-grade tools for strategic land acquisition and portfolio management.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {purchaseOptions.filter(option => option.featured).map((option, index) => (
            <Grid item xs={12} md={6} key={option.path}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: `linear-gradient(135deg, 
                    ${theme.palette[option.color as keyof typeof theme.palette].main}10 0%, 
                    ${theme.palette[option.color as keyof typeof theme.palette].main}05 100%
                  )`,
                  border: `3px solid`,
                  borderColor: `${option.color}.light`,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: `linear-gradient(90deg, ${theme.palette[option.color as keyof typeof theme.palette].main}, ${theme.palette[option.color as keyof typeof theme.palette].dark})`,
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: theme.shadows[20],
                    borderColor: `${option.color}.main`,
                  }
                }}
                onClick={() => router.push(option.path)}
              >
                <CardContent sx={{ p: 5 }}>
                  <Stack spacing={3}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                      <Avatar 
                        sx={{ 
                          bgcolor: `${option.color}.main`,
                          width: 72,
                          height: 72,
                          fontSize: '2rem'
                        }}
                      >
                        {option.icon}
                      </Avatar>
                      <Chip 
                        label="Featured"
                        size="small"
                        sx={{ 
                          bgcolor: `${option.color}.main`,
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="h4" component="h3" gutterBottom fontWeight={800}>
                        {option.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {option.description}
                      </Typography>
                    </Box>
                    
                    <GlowingButton 
                      variant="contained" 
                      color={option.color as any}
                      size="large"
                      fullWidth
                      endIcon={<SpeedIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(option.path);
                      }}
                      sx={{ 
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700
                      }}
                    >
                      Start {option.title === 'Land Explorer' ? 'Exploring' : 'Trading'} Now
                    </GlowingButton>
                  </Stack>
                </CardContent>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Professional Tools */}
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2
            }}
          >
            <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
              <TimelineIcon />
            </Avatar>
            Professional Analytics
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Advanced analysis and portfolio management tools for experienced investors.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {purchaseOptions.filter(option => !option.featured).map((option, index) => (
            <Grid item xs={12} md={6} key={option.path}>
              <FeatureCard onClick={() => router.push(option.path)}>
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${option.color}.main`,
                        width: 56,
                        height: 56
                      }}
                    >
                      {option.icon}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                        {option.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {option.description}
                      </Typography>
                    </Box>
                    
                    <Button 
                      variant="outlined" 
                      color={option.color as any}
                      fullWidth
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(option.path);
                      }}
                      sx={{ 
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                        }
                      }}
                    >
                      Access Tools
                    </Button>
                  </Stack>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default LandManagementPage;