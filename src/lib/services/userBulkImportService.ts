import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BulkImportUserDto, AdminBulkCreateUserDto } from './userService';
import { UserImportTemplateGenerator } from '@/lib/utils/userImportTemplate';

export interface ImportValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: ImportValidationError[];
  validUsers: BulkImportUserDto[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface ImportProgressCallback {
  (current: number, total: number, message?: string): void;
}

export class UserBulkImportService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly MAX_ROWS = 1000;
  private static readonly BATCH_SIZE = 50;

  /**
   * Parse and validate uploaded file
   */
  static async parseFile(
    file: File,
    onProgress?: ImportProgressCallback
  ): Promise<ImportValidationResult> {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      return this.parseCSV(file, onProgress);
    } else if (['xlsx', 'xls'].includes(extension || '')) {
      return this.parseExcel(file, onProgress);
    } else {
      throw new Error('Unsupported file format. Please upload CSV or Excel file.');
    }
  }

  /**
   * Parse CSV file
   */
  private static parseCSV(
    file: File,
    onProgress?: ImportProgressCallback
  ): Promise<ImportValidationResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
            return;
          }

          const validationResult = this.validateData(results.data, onProgress);
          resolve(validationResult);
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  }

  /**
   * Parse Excel file
   */
  private static async parseExcel(
    file: File,
    onProgress?: ImportProgressCallback
  ): Promise<ImportValidationResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });

          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

          const validationResult = this.validateData(jsonData, onProgress);
          resolve(validationResult);
        } catch (error) {
          reject(new Error(`Failed to parse Excel: ${(error as Error).message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Validate imported data
   */
  private static validateData(
    data: any[],
    onProgress?: ImportProgressCallback
  ): ImportValidationResult {
    const errors: ImportValidationError[] = [];
    const validUsers: BulkImportUserDto[] = [];

    // Check row count
    if (data.length > this.MAX_ROWS) {
      errors.push({
        row: 0,
        field: 'file',
        value: data.length,
        message: `File contains ${data.length} rows, maximum allowed is ${this.MAX_ROWS}`
      });
    }

    // Validate headers
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const headerValidation = UserImportTemplateGenerator.validateHeaders(headers);

      if (!headerValidation.valid) {
        headerValidation.missing.forEach(header => {
          errors.push({
            row: 0,
            field: 'headers',
            value: headers.join(', '),
            message: `Missing required column: ${header}`
          });
        });
      }
    }

    // Process each row
    data.forEach((row, index) => {
      if (onProgress) {
        onProgress(index + 1, data.length, `Validating row ${index + 2}`);
      }

      const rowNumber = index + 2; // +2 for 1-based index and header row
      const rowErrors: ImportValidationError[] = [];

      // Validate required fields
      if (!row.username || row.username.trim() === '') {
        rowErrors.push({
          row: rowNumber,
          field: 'username',
          value: row.username,
          message: 'Username is required'
        });
      } else if (!/^[a-zA-Z0-9_]+$/.test(row.username)) {
        rowErrors.push({
          row: rowNumber,
          field: 'username',
          value: row.username,
          message: 'Username can only contain letters, numbers, and underscores'
        });
      }

      if (!row.email || row.email.trim() === '') {
        rowErrors.push({
          row: rowNumber,
          field: 'email',
          value: row.email,
          message: 'Email is required'
        });
      } else if (!this.validateEmail(row.email)) {
        rowErrors.push({
          row: rowNumber,
          field: 'email',
          value: row.email,
          message: 'Invalid email format'
        });
      }

      if (!row.password || row.password.trim() === '') {
        rowErrors.push({
          row: rowNumber,
          field: 'password',
          value: row.password,
          message: 'Password is required'
        });
      } else if (!this.validatePassword(row.password)) {
        rowErrors.push({
          row: rowNumber,
          field: 'password',
          value: '***',
          message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
        });
      }

      // Validate userType
      const userType = parseInt(row.userType);
      if (isNaN(userType) || ![1, 2, 3].includes(userType)) {
        rowErrors.push({
          row: rowNumber,
          field: 'userType',
          value: row.userType,
          message: 'UserType must be 1 (Manager), 2 (Worker), or 3 (Student)'
        });
      }

      // Parse isActive (optional, defaults to true)
      let isActive = true;
      if (row.isActive !== undefined && row.isActive !== '') {
        const activeValue = row.isActive.toString().toLowerCase();
        if (!['true', 'false', '1', '0'].includes(activeValue)) {
          rowErrors.push({
            row: rowNumber,
            field: 'isActive',
            value: row.isActive,
            message: 'isActive must be true or false'
          });
        } else {
          isActive = activeValue === 'true' || activeValue === '1';
        }
      }

      // If no errors, add to valid users
      if (rowErrors.length === 0) {
        validUsers.push({
          username: row.username.trim(),
          email: row.email.trim(),
          password: row.password,
          firstName: row.firstName?.trim() || undefined,
          lastName: row.lastName?.trim() || undefined,
          userType: userType,
          isActive: isActive
          // Note: sendWelcomeEmail removed as it's not accepted by bulk-import endpoint
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      validUsers,
      totalRows: data.length,
      validRows: validUsers.length,
      invalidRows: data.length - validUsers.length
    };
  }

  /**
   * Validate email format
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private static validatePassword(password: string): boolean {
    // At least 8 characters
    if (password.length < 8) return false;

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) return false;

    // At least one lowercase letter
    if (!/[a-z]/.test(password)) return false;

    // At least one number
    if (!/[0-9]/.test(password)) return false;

    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

    return true;
  }

  /**
   * Generate error report CSV
   */
  static generateErrorReport(errors: ImportValidationError[]): string {
    const headers = ['Row', 'Field', 'Value', 'Error Message'];
    const rows = errors.map(error => [
      error.row.toString(),
      error.field,
      error.value?.toString() || '',
      error.message
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Download error report
   */
  static downloadErrorReport(errors: ImportValidationError[]): void {
    const csvContent = this.generateErrorReport(errors);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user-import-errors-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}