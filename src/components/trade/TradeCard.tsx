'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Stack,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CheckCircle as AcceptedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Done as CompletedIcon
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { TradeSummary, TradeStatus } from '@/types/trade';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface TradeCardProps {
  trade: TradeSummary;
  type: 'incoming' | 'outgoing';
  onView: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}

/**
 * Trade Card Component
 * Displays a summary of a trade offer in card format
 */
export default function TradeCard({
  trade,
  type,
  onView,
  onAccept,
  onReject,
  onCancel
}: TradeCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const getStatusIcon = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.PENDING:
        return <PendingIcon />;
      case TradeStatus.ACCEPTED:
        return <AcceptedIcon />;
      case TradeStatus.REJECTED:
        return <RejectedIcon />;
      case TradeStatus.COMPLETED:
        return <CompletedIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.PENDING:
        return 'warning';
      case TradeStatus.ACCEPTED:
        return 'info';
      case TradeStatus.REJECTED:
        return 'error';
      case TradeStatus.COMPLETED:
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const partnerTeam = type === 'incoming' ? trade.senderTeam : trade.targetTeam;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <CardContent>
          {/* Status Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: 16,
              px: 2,
              py: 0.5,
              bgcolor: `${getStatusColor(trade.status)}.main`,
              color: 'white',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            {getStatusIcon(trade.status)}
            <Typography variant="caption" fontWeight="bold">
              {trade.status}
            </Typography>
          </Box>

          {/* Header */}
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                width: 48,
                height: 48
              }}
            >
              <GroupIcon />
            </Avatar>
            <Box ml={2} flex={1}>
              <Typography variant="h6" gutterBottom>
                {type === 'incoming' ? 'From' : 'To'}: {partnerTeam?.name || 'Unknown Team'}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <ScheduleIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(trade.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Trade Details */}
          <Stack spacing={2}>
            {/* Items Summary */}
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <InventoryIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight="medium">
                    {trade.itemCount} {trade.itemCount === 1 ? 'Item' : 'Items'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {trade.totalQuantity} units total
                </Typography>
              </Box>
            </Box>

            {/* Price */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <MoneyIcon color="warning" />
                <Typography variant="body1">Price:</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {trade.totalPrice.toLocaleString()} gold
              </Typography>
            </Box>

            {/* Message Preview */}
            {trade.message && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Message:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  "{trade.message}"
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>

        <Divider />

        <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
          <Button
            size="small"
            onClick={onView}
            endIcon={<ArrowForwardIcon />}
          >
            View Details
          </Button>

          {trade.status === TradeStatus.PENDING && (
            <Box display="flex" gap={1}>
              {type === 'incoming' && onAccept && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={onAccept}
                >
                  Accept
                </Button>
              )}
              {type === 'incoming' && onReject && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={onReject}
                >
                  Reject
                </Button>
              )}
              {type === 'outgoing' && onCancel && (
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </Box>
          )}
        </CardActions>
      </Card>
    </motion.div>
  );
}