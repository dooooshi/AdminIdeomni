import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface UserImportTemplateRow {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userType: number | string;
  isActive: boolean | string;
}

export class UserImportTemplateGenerator {
  private static readonly SAMPLE_DATA: UserImportTemplateRow[] = [
    {
      username: 'john_doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      userType: 3,
      isActive: true
    },
    {
      username: 'jane_smith',
      email: 'jane.smith@example.com',
      password: 'SecurePass456!',
      firstName: 'Jane',
      lastName: 'Smith',
      userType: 2,
      isActive: true
    },
    {
      username: 'bob_manager',
      email: 'bob.manager@example.com',
      password: 'SecurePass789!',
      firstName: 'Bob',
      lastName: 'Johnson',
      userType: 1,
      isActive: true
    }
  ];

  private static readonly INSTRUCTIONS = [
    ['Field', 'Required', 'Description', 'Example', 'Notes'],
    ['username', 'Yes', 'Unique username for login', 'john_doe', 'Must be unique, alphanumeric and underscore only'],
    ['email', 'Yes', 'User email address', 'john@example.com', 'Must be valid email format'],
    ['password', 'Yes', 'Initial password', 'SecurePass123!', 'Minimum 8 characters, include uppercase, lowercase, number, and special character'],
    ['firstName', 'No', 'User first name', 'John', 'Text field'],
    ['lastName', 'No', 'User last name', 'Doe', 'Text field'],
    ['userType', 'Yes', 'Type of user account', '3', '1=Manager, 2=Worker, 3=Student'],
    ['isActive', 'No', 'Account status', 'true', 'true or false, defaults to true if not provided']
  ];

  private static readonly VALIDATION_RULES = [
    ['Validation Rules'],
    [''],
    ['1. Username must be unique across the system'],
    ['2. Email must be in valid format and unique'],
    ['3. Password must meet security requirements:'],
    ['   - At least 8 characters'],
    ['   - At least one uppercase letter'],
    ['   - At least one lowercase letter'],
    ['   - At least one number'],
    ['   - At least one special character'],
    ['4. UserType must be 1, 2, or 3'],
    ['5. Maximum 1000 users per import'],
    ['6. File size must not exceed 5MB']
  ];

  /**
   * Generate and download CSV template
   */
  static downloadCSVTemplate(): void {
    const headers = ['username', 'email', 'password', 'firstName', 'lastName', 'userType', 'isActive'];
    const rows = this.SAMPLE_DATA.map(row => [
      row.username,
      row.email,
      row.password,
      row.firstName || '',
      row.lastName || '',
      row.userType.toString(),
      row.isActive.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'user-import-template.csv');
  }

  /**
   * Generate and download Excel template with instructions
   */
  static downloadExcelTemplate(): void {
    const wb = XLSX.utils.book_new();

    // Data Sheet
    const dataSheet = XLSX.utils.aoa_to_sheet([
      ['username', 'email', 'password', 'firstName', 'lastName', 'userType', 'isActive'],
      ...this.SAMPLE_DATA.map(row => [
        row.username,
        row.email,
        row.password,
        row.firstName || '',
        row.lastName || '',
        row.userType,
        row.isActive
      ])
    ]);

    // Set column widths for better readability
    dataSheet['!cols'] = [
      { wch: 15 }, // username
      { wch: 25 }, // email
      { wch: 20 }, // password
      { wch: 15 }, // firstName
      { wch: 15 }, // lastName
      { wch: 10 }, // userType
      { wch: 10 }  // isActive
    ];

    // Instructions Sheet
    const instructionsSheet = XLSX.utils.aoa_to_sheet(this.INSTRUCTIONS);
    instructionsSheet['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 40 },
      { wch: 20 },
      { wch: 50 }
    ];

    // Validation Rules Sheet
    const rulesSheet = XLSX.utils.aoa_to_sheet(this.VALIDATION_RULES);
    rulesSheet['!cols'] = [{ wch: 80 }];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, dataSheet, 'User Data');
    XLSX.utils.book_append_sheet(wb, instructionsSheet, 'Field Instructions');
    XLSX.utils.book_append_sheet(wb, rulesSheet, 'Validation Rules');

    // Write file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }

    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'user-import-template.xlsx');
  }

  /**
   * Validate if headers match expected format
   */
  static validateHeaders(headers: string[]): { valid: boolean; missing: string[]; extra: string[] } {
    const requiredHeaders = ['username', 'email', 'password', 'userType'];
    const optionalHeaders = ['firstName', 'lastName', 'isActive'];
    const allExpectedHeaders = [...requiredHeaders, ...optionalHeaders];

    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    const missing = requiredHeaders.filter(h => !normalizedHeaders.includes(h.toLowerCase()));
    const extra = normalizedHeaders.filter(h => !allExpectedHeaders.includes(h));

    return {
      valid: missing.length === 0,
      missing,
      extra
    };
  }

  /**
   * Map headers to indices for parsing
   */
  static mapHeaders(headers: string[]): Map<string, number> {
    const headerMap = new Map<string, number>();
    headers.forEach((header, index) => {
      headerMap.set(header.trim().toLowerCase(), index);
    });
    return headerMap;
  }
}