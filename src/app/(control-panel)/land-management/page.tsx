'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import { 
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  AccountBalance as PortfolioIcon 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

/**
 * Land Management Hub Page
 * Provides navigation to different land management sections based on user role
 */
const LandManagementPage: React.FC = () => {
  const router = useRouter();

  // In a real implementation, you would get user type from auth context
  // For now, we'll provide navigation options for both manager and student views
  
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

  const studentOptions = [
    {
      title: 'Land Map',
      description: 'Interactive map for exploring and purchasing available land',
      icon: <MapIcon fontSize="large" />,
      path: '/land-management/student/map',
      color: 'primary'
    },
    {
      title: 'Land Portfolio',
      description: 'Manage and monitor your team\'s land ownership',
      icon: <PortfolioIcon fontSize="large" />,
      path: '/land-management/student/portfolio',
      color: 'warning'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Land Management System
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to the comprehensive land management system. Choose your interface based on your role.
      </Typography>

      {/* Manager Interface Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Manager Interface
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          For managers and administrators to oversee land activities across all teams.
        </Typography>
        
        <Grid container spacing={3}>
          {managerOptions.map((option) => (
            <Grid item xs={12} md={4} key={option.path}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => router.push(option.path)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box 
                    sx={{ 
                      color: `${option.color}.main`,
                      mb: 2 
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {option.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color={option.color as any}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(option.path);
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Student Interface Section */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Student Interface
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          For students and team members to purchase and manage land.
        </Typography>
        
        <Grid container spacing={3}>
          {studentOptions.map((option) => (
            <Grid item xs={12} md={6} key={option.path}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => router.push(option.path)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box 
                    sx={{ 
                      color: `${option.color}.main`,
                      mb: 2 
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {option.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color={option.color as any}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(option.path);
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default LandManagementPage;