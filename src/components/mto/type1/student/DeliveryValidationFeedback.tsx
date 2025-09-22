'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Button,
  Collapse,
  Paper,
  LinearProgress,
  Tooltip,
  IconButton,
  Badge
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  Inventory as MaterialIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  AccountBalance as BalanceIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MtoType1Calculator } from '@/lib/utils/mtoType1Calculator';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  info?: string[];
}

interface FormulaValidation {
  craftCategories: {
    required: string[];
    provided: string[];
    missing: string[];
    extra: string[];
  };
  materials: {
    required: Array<{ id: string; quantity: number }>;
    provided: Array<{ id: string; quantity: number }>;
    mismatches: Array<{ id: string; required: number; provided: number }>;
    missing: string[];
  };
}

interface DeliveryValidation {
  teamBalance: {
    required: number;
    available: number;
    sufficient: boolean;
  };
  timeWindow: {
    isOpen: boolean;
    releaseTime: Date;
    settlementTime: Date;
    currentTime: Date;
  };
  tileRequirement: {
    total: number;
    delivered: number;
    remaining: number;
    deliveryQuantity: number;
    canFulfill: boolean;
  };
  transportationFee: {
    distance: number;
    fee: number;
    mode: string;
  };
}

interface Props {
  deliveryData?: {
    teamId: string;
    tileId: string;
    quantity: number;
    products: any[];
  };
  requirementData?: {
    formulaId: number;
    releaseTime: Date;
    settlementTime: Date;
    remainingRequirement: number;
  };
  teamBalance?: number;
  onValidation?: (result: ValidationResult) => void;
}

const DeliveryValidationFeedback: React.FC<Props> = ({
  deliveryData,
  requirementData,
  teamBalance = 1000,
  onValidation
}) => {
  const { t } = useTranslation(['mto']);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [formulaValidation, setFormulaValidation] = useState<FormulaValidation | null>(null);
  const [deliveryValidation, setDeliveryValidation] = useState<DeliveryValidation | null>(null);

  const calculator = new MtoType1Calculator();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const validateDelivery = () => {
    if (!deliveryData || !requirementData) return;

    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    // Formula Validation
    const formulaVal: FormulaValidation = {
      craftCategories: {
        required: ['Electronics', 'Assembly'],
        provided: ['Electronics', 'Assembly', 'Testing'],
        missing: [],
        extra: ['Testing']
      },
      materials: {
        required: [
          { id: 'MAT001', quantity: 10 },
          { id: 'MAT002', quantity: 5 }
        ],
        provided: [
          { id: 'MAT001', quantity: 8 },
          { id: 'MAT002', quantity: 5 }
        ],
        mismatches: [{ id: 'MAT001', required: 10, provided: 8 }],
        missing: []
      }
    };

    if (formulaVal.craftCategories.extra.length > 0) {
      warnings.push(`Extra craft categories detected: ${formulaVal.craftCategories.extra.join(', ')}`);
    }

    if (formulaVal.materials.mismatches.length > 0) {
      formulaVal.materials.mismatches.forEach(m => {
        errors.push(`Material ${m.id}: Required ${m.required}, Provided ${m.provided}`);
      });
    }

    // Delivery Validation
    const transportFee = calculator.calculateTransportationFee(
      calculator.calculateDistance(deliveryData.tileId, 'facility-1'),
      deliveryData.quantity
    );

    const deliveryVal: DeliveryValidation = {
      teamBalance: {
        required: transportFee,
        available: teamBalance,
        sufficient: teamBalance >= transportFee
      },
      timeWindow: {
        isOpen: true,
        releaseTime: requirementData.releaseTime,
        settlementTime: requirementData.settlementTime,
        currentTime: new Date()
      },
      tileRequirement: {
        total: 100,
        delivered: 30,
        remaining: requirementData.remainingRequirement,
        deliveryQuantity: deliveryData.quantity,
        canFulfill: deliveryData.quantity <= requirementData.remainingRequirement
      },
      transportationFee: {
        distance: calculator.calculateDistance(deliveryData.tileId, 'facility-1'),
        fee: transportFee,
        mode: 'Standard'
      }
    };

    if (!deliveryVal.teamBalance.sufficient) {
      errors.push('Insufficient team balance for transportation fee');
    }

    if (!deliveryVal.tileRequirement.canFulfill) {
      errors.push(`Delivery quantity (${deliveryData.quantity}) exceeds remaining requirement (${requirementData.remainingRequirement})`);
    }

    if (deliveryVal.tileRequirement.remaining < 20) {
      warnings.push('Tile requirement is almost fulfilled');
    }

    info.push(`Transportation fee: $${transportFee.toFixed(2)}`);
    info.push(`Distance to tile: ${deliveryVal.transportationFee.distance.toFixed(1)} units`);

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    };

    setValidationResult(result);
    setFormulaValidation(formulaVal);
    setDeliveryValidation(deliveryVal);

    if (onValidation) {
      onValidation(result);
    }
  };

  const getSeverityColor = (severity: 'error' | 'warning' | 'info' | 'success') => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('mto:mtoType1.validation.title')}
          </Typography>

          <Button
            variant="contained"
            onClick={validateDelivery}
            disabled={!deliveryData || !requirementData}
            fullWidth
            sx={{ mb: 2 }}
          >
            {t('mto:mtoType1.validation.validate')}
          </Button>

          {validationResult && (
            <>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: validationResult.valid ? 'success.light' : 'error.light'
                }}
              >
                <Box display="flex" alignItems="center">
                  {validationResult.valid ? (
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                  ) : (
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="h6">
                    {validationResult.valid
                      ? t('mto:mtoType1.validation.passed')
                      : t('mto:mtoType1.validation.failed')}
                  </Typography>
                </Box>
              </Paper>

              <Box sx={{ mb: 2 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ cursor: 'pointer', p: 1 }}
                  onClick={() => toggleSection('summary')}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Validation Summary
                  </Typography>
                  <IconButton size="small">
                    {expandedSections.has('summary') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Collapse in={expandedSections.has('summary')}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 4 }}>
                      <Badge badgeContent={validationResult.errors.length} color="error">
                        <Chip
                          icon={<ErrorIcon />}
                          label="Errors"
                          color="error"
                          variant="outlined"
                        />
                      </Badge>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Badge badgeContent={validationResult.warnings?.length || 0} color="warning">
                        <Chip
                          icon={<WarningIcon />}
                          label="Warnings"
                          color="warning"
                          variant="outlined"
                        />
                      </Badge>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Badge badgeContent={validationResult.info?.length || 0} color="info">
                        <Chip
                          icon={<InfoIcon />}
                          label="Info"
                          color="info"
                          variant="outlined"
                        />
                      </Badge>
                    </Grid>
                  </Grid>

                  {validationResult.errors.length > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <AlertTitle>Errors</AlertTitle>
                      <List dense>
                        {validationResult.errors.map((error, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <ErrorIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={error} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}

                  {validationResult.warnings && validationResult.warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <AlertTitle>Warnings</AlertTitle>
                      <List dense>
                        {validationResult.warnings.map((warning, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <WarningIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={warning} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}

                  {validationResult.info && validationResult.info.length > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <AlertTitle>Information</AlertTitle>
                      <List dense>
                        {validationResult.info.map((info, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <InfoIcon color="info" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={info} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                </Collapse>
              </Box>

              <Divider sx={{ my: 2 }} />

              {formulaValidation && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ cursor: 'pointer', p: 1 }}
                    onClick={() => toggleSection('formula')}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Formula Validation
                    </Typography>
                    <IconButton size="small">
                      {expandedSections.has('formula') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  <Collapse in={expandedSections.has('formula')}>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Craft Categories
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {formulaValidation.craftCategories.required.map(cat => (
                          <Grid size="auto" key={cat}>
                            <Chip
                              label={cat}
                              color={formulaValidation.craftCategories.provided.includes(cat) ? 'success' : 'error'}
                              size="small"
                            />
                          </Grid>
                        ))}
                        {formulaValidation.craftCategories.extra.map(cat => (
                          <Grid size="auto" key={cat}>
                            <Chip
                              label={`${cat} (extra)`}
                              color="warning"
                              size="small"
                            />
                          </Grid>
                        ))}
                      </Grid>

                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Materials
                      </Typography>
                      <List dense>
                        {formulaValidation.materials.required.map(mat => {
                          const provided = formulaValidation.materials.provided.find(p => p.id === mat.id);
                          const isValid = provided?.quantity === mat.quantity;

                          return (
                            <ListItem key={mat.id}>
                              <ListItemIcon>
                                {isValid ? (
                                  <CheckIcon color="success" fontSize="small" />
                                ) : (
                                  <ErrorIcon color="error" fontSize="small" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={mat.id}
                                secondary={`Required: ${mat.quantity} | Provided: ${provided?.quantity || 0}`}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Paper>
                  </Collapse>
                </Box>
              )}

              {deliveryValidation && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ cursor: 'pointer', p: 1 }}
                    onClick={() => toggleSection('delivery')}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Delivery Validation
                    </Typography>
                    <IconButton size="small">
                      {expandedSections.has('delivery') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  <Collapse in={expandedSections.has('delivery')}>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <BalanceIcon sx={{ mr: 1 }} />
                            <Typography variant="body2" color="textSecondary">
                              Team Balance Check
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (deliveryValidation.teamBalance.available / deliveryValidation.teamBalance.required) * 100)}
                            color={deliveryValidation.teamBalance.sufficient ? 'success' : 'error'}
                          />
                          <Typography variant="caption" color="textSecondary">
                            ${deliveryValidation.teamBalance.available} / ${deliveryValidation.teamBalance.required}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationIcon sx={{ mr: 1 }} />
                            <Typography variant="body2" color="textSecondary">
                              Tile Requirement
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(deliveryValidation.tileRequirement.delivered / deliveryValidation.tileRequirement.total) * 100}
                            color="primary"
                          />
                          <Typography variant="caption" color="textSecondary">
                            {deliveryValidation.tileRequirement.remaining} remaining of {deliveryValidation.tileRequirement.total}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <MoneyIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary="Transportation Fee"
                                secondary={`$${deliveryValidation.transportationFee.fee.toFixed(2)} (${deliveryValidation.transportationFee.distance.toFixed(1)} units)`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <TimeIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary="Time Window"
                                secondary={deliveryValidation.timeWindow.isOpen ? 'Open for delivery' : 'Closed'}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Collapse>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeliveryValidationFeedback;