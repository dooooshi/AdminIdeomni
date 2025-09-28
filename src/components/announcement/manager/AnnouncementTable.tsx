'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Box,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { deleteAnnouncement } from '@/store/announcementSlice';
import { Announcement } from '@/types/announcement';
import { formatRelativeTime } from '@/lib/utils/dateFormatter';
import ReactionDisplay from '@/components/announcement/common/ReactionDisplay';

interface AnnouncementTableProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  showRestore?: boolean;
}

export default function AnnouncementTable({
  announcements,
  onEdit,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  showRestore = false
}: AnnouncementTableProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async (announcement: Announcement) => {
    if (window.confirm(t('announcement.confirmDelete'))) {
      dispatch(deleteAnnouncement(announcement.id));
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('announcement.table.title')}</TableCell>
              <TableCell>{t('announcement.table.content')}</TableCell>
              <TableCell align="center">{t('announcement.table.reactions')}</TableCell>
              <TableCell>{t('announcement.table.createdAt')}</TableCell>
              <TableCell>{t('announcement.table.status')}</TableCell>
              <TableCell align="center">{t('announcement.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell>
                  <Box>
                    <strong>{announcement.title}</strong>
                  </Box>
                </TableCell>
                <TableCell>
                  {truncateContent(announcement.content)}
                </TableCell>
                <TableCell align="center">
                  <ReactionDisplay
                    likeCount={announcement.likeCount}
                    dislikeCount={announcement.dislikeCount}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {formatRelativeTime(announcement.createdAt, t, i18n.language)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={announcement.isActive ? t('common.active') : t('common.archived')}
                    color={announcement.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box>
                    {announcement.isActive ? (
                      <>
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => onEdit(announcement)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(announcement)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      showRestore && (
                        <Tooltip title={t('common.restore')}>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </>
  );
}