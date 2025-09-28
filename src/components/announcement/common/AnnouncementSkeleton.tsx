'use client';

import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface AnnouncementSkeletonProps {
  count?: number;
  variant?: 'card' | 'list';
}

export default function AnnouncementSkeleton({
  count = 3,
  variant = 'card'
}: AnnouncementSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            {/* Author section */}
            <Box display="flex" alignItems="center" mb={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box ml={2} flex={1}>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="20%" />
              </Box>
            </Box>

            {/* Title */}
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />

            {/* Content */}
            {variant === 'card' && (
              <>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="80%" />
              </>
            )}

            {/* Reaction section */}
            <Box display="flex" alignItems="center" mt={2} gap={2}>
              <Skeleton variant="rectangular" width={80} height={32} />
              <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
}