'use client';

import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  textColor: string;
}

interface TeamStatsCardsProps {
  stats: StatCard[];
  className?: string;
}

/**
 * Reusable Team Statistics Cards Component
 */
function TeamStatsCards({ stats, className = '' }: TeamStatsCardsProps) {
  const container = {
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <Paper 
              component={motion.div}
              variants={item}
              className="p-6 text-center hover:shadow-lg transition-shadow"
            >
              <IdeomniSvgIcon 
                size={48} 
                className={`${stat.color} mx-auto mb-2`}
              >
                {stat.icon}
              </IdeomniSvgIcon>
              <Typography 
                variant="h4" 
                className={`font-bold ${stat.textColor}`}
              >
                {stat.value}
              </Typography>
              <Typography color="text.secondary">
                {stat.title}
              </Typography>
              {stat.subtitle && (
                <Typography variant="caption" color="text.secondary" className="block mt-1">
                  {stat.subtitle}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}

export default TeamStatsCards;