'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Typography,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCart as PurchaseIcon,
  AttachMoney as PriceIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { RootState } from '@/store/store';
import { ShopActionType, ActionCategory } from '@/types/shop';

const actionIcons: Record<ShopActionType, React.ReactNode> = {
  [ShopActionType.SHOP_CREATED]: <AddIcon fontSize="small" />,
  [ShopActionType.MATERIAL_ADDED]: <AddIcon fontSize="small" />,
  [ShopActionType.MATERIAL_REMOVED]: <RemoveIcon fontSize="small" />,
  [ShopActionType.MATERIAL_PRICE_SET]: <PriceIcon fontSize="small" />,
  [ShopActionType.MATERIAL_STOCK_UPDATED]: <InfoIcon fontSize="small" />,
  [ShopActionType.PURCHASE_COMPLETED]: <PurchaseIcon fontSize="small" />,
  [ShopActionType.PURCHASE_FAILED]: <PurchaseIcon fontSize="small" />,
  [ShopActionType.PURCHASE_REFUNDED]: <PurchaseIcon fontSize="small" />,
};

const categoryColors: Record<ActionCategory, string> = {
  [ActionCategory.MATERIAL_MGMT]: 'primary',
  [ActionCategory.PRICING]: 'warning',
  [ActionCategory.TRANSACTION]: 'success',
};

export default function ShopHistoryTable() {
  const { shopHistory = [], shopHistoryLoading = false, shopHistoryPagination = null } = useSelector(
    (state: RootState) => state.shop || {}
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getActionLabel = (actionType: ShopActionType) => {
    return actionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (shopHistoryLoading) {
    return (
      <Box>
        {[1, 2, 3, 4, 5].map((n) => (
          <Skeleton key={n} variant="rectangular" height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  const paginatedHistory = Array.isArray(shopHistory)
    ? shopHistory.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      )
    : [];

  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                    No history records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedHistory.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{formatDate(record.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {actionIcons[record.actionType]}
                      <Typography variant="body2">
                        {getActionLabel(record.actionType)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.actionCategory.replace(/_/g, ' ')}
                      size="small"
                      color={categoryColors[record.actionCategory] as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{record.actor.username}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {record.actor.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{record.changeDescription}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {record.newValue && (
                      <Tooltip
                        title={
                          <Box>
                            {record.previousValue && (
                              <Typography variant="caption">
                                Previous: {JSON.stringify(record.previousValue)}
                              </Typography>
                            )}
                            <Typography variant="caption">
                              New: {JSON.stringify(record.newValue)}
                            </Typography>
                          </Box>
                        }
                      >
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={Array.isArray(shopHistory) ? shopHistory.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}