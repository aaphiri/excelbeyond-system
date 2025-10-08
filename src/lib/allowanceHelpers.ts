import Papa from 'papaparse';
import { supabase } from './supabase';

export interface AllowanceCSVRow {
  student_id?: string;
  student_name?: string;
  chl_number?: string;
  month?: string;
  year?: string;
  program_level?: string;
  stipend?: string;
  medical?: string;
  transportation?: string;
  school_supplies?: string;
  accommodation?: string;
  flmi_comments?: string;
}

export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data: AllowanceCSVRow }>;
}

export const generateCSVTemplate = (): string => {
  const headers = [
    'student_id',
    'student_name',
    'chl_number',
    'month',
    'year',
    'program_level',
    'stipend',
    'medical',
    'transportation',
    'school_supplies',
    'accommodation',
    'flmi_comments'
  ];

  const sampleRows = [
    {
      student_id: '550e8400-e29b-41d4-a716-446655440001',
      student_name: 'Grace Tembo',
      chl_number: 'CHL001',
      month: 'October',
      year: '2025',
      program_level: 'university',
      stipend: '1500',
      medical: '200',
      transportation: '300',
      school_supplies: '500',
      accommodation: '1200',
      flmi_comments: 'Regular monthly allowance'
    },
    {
      student_id: '550e8400-e29b-41d4-a716-446655440002',
      student_name: 'John Banda',
      chl_number: 'CHL002',
      month: 'October',
      year: '2025',
      program_level: 'launch_year',
      stipend: '1000',
      medical: '0',
      transportation: '0',
      school_supplies: '0',
      accommodation: '0',
      flmi_comments: 'Launch year program - stipend only'
    }
  ];

  const csv = Papa.unparse({
    fields: headers,
    data: sampleRows
  });

  return csv;
};

export const downloadCSVTemplate = (): void => {
  const csv = generateCSVTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'allowances_template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const validateAllowanceRow = (row: AllowanceCSVRow, rowIndex: number): string | null => {
  if (!row.student_id && !row.chl_number) {
    return `Row ${rowIndex}: Either student_id or chl_number is required`;
  }

  if (!row.student_name || row.student_name.trim() === '') {
    return `Row ${rowIndex}: student_name is required`;
  }

  if (!row.month || row.month.trim() === '') {
    return `Row ${rowIndex}: month is required`;
  }

  if (!row.year || isNaN(Number(row.year))) {
    return `Row ${rowIndex}: valid year is required`;
  }

  const validProgramLevels = ['launch_year', 'university', 'college'];
  const programLevel = row.program_level?.toLowerCase() || 'university';
  if (!validProgramLevels.includes(programLevel)) {
    return `Row ${rowIndex}: program_level must be one of: launch_year, university, college`;
  }

  const validMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const capitalizedMonth = row.month.charAt(0).toUpperCase() + row.month.slice(1).toLowerCase();
  if (!validMonths.includes(capitalizedMonth)) {
    return `Row ${rowIndex}: month must be a valid month name`;
  }

  if (!row.stipend || isNaN(Number(row.stipend)) || Number(row.stipend) < 0) {
    return `Row ${rowIndex}: valid stipend amount is required`;
  }

  if (programLevel !== 'launch_year') {
    if (row.medical && isNaN(Number(row.medical))) {
      return `Row ${rowIndex}: medical must be a valid number`;
    }
    if (row.transportation && isNaN(Number(row.transportation))) {
      return `Row ${rowIndex}: transportation must be a valid number`;
    }
    if (row.school_supplies && isNaN(Number(row.school_supplies))) {
      return `Row ${rowIndex}: school_supplies must be a valid number`;
    }
    if (row.accommodation && isNaN(Number(row.accommodation))) {
      return `Row ${rowIndex}: accommodation must be a valid number`;
    }
  }

  return null;
};

export const parseCSVFile = (file: File): Promise<AllowanceCSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results) => {
        resolve(results.data as AllowanceCSVRow[]);
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

export const processBulkAllowances = async (
  rows: AllowanceCSVRow[],
  userId: string,
  userName: string
): Promise<BulkUploadResult> => {
  const result: BulkUploadResult = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const validationError = validateAllowanceRow(row, rowNumber);
    if (validationError) {
      result.failed++;
      result.errors.push({ row: rowNumber, error: validationError, data: row });
      continue;
    }

    try {
      const programLevel = (row.program_level?.toLowerCase() || 'university') as 'launch_year' | 'university' | 'college';

      const stipend = parseFloat(row.stipend || '0');
      const medical = programLevel === 'launch_year' ? 0 : parseFloat(row.medical || '0');
      const transportation = programLevel === 'launch_year' ? 0 : parseFloat(row.transportation || '0');
      const schoolSupplies = programLevel === 'launch_year' ? 0 : parseFloat(row.school_supplies || '0');
      const accommodation = programLevel === 'launch_year' ? 0 : parseFloat(row.accommodation || '0');

      const total = stipend + medical + transportation + schoolSupplies + accommodation;

      const capitalizedMonth = row.month!.charAt(0).toUpperCase() + row.month!.slice(1).toLowerCase();

      const allowanceData = {
        student_id: row.student_id || null,
        student_name: row.student_name!.trim(),
        month: capitalizedMonth,
        year: parseInt(row.year!),
        program_level: programLevel,
        stipend,
        medical,
        transportation,
        school_supplies: schoolSupplies,
        accommodation,
        total,
        approval_stage: 'pending_dpm',
        submitted_by: userName,
        submitted_by_id: userId,
        submitted_date: new Date().toISOString(),
        flmi_comments: row.flmi_comments || null
      };

      const { error: insertError } = await supabase
        .from('allowances')
        .insert([allowanceData]);

      if (insertError) {
        throw insertError;
      }

      result.success++;
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push({
        row: rowNumber,
        error: `Database error: ${errorMessage}`,
        data: row
      });
    }
  }

  return result;
};

export const getApprovalStageLabel = (stage: string): string => {
  const labels: Record<string, string> = {
    'pending_dpm': 'Pending Deputy Manager',
    'pending_flmi': 'Pending FLMI Advisor',
    'pending_pm': 'Pending Program Manager',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'paid': 'Paid'
  };
  return labels[stage] || stage;
};

export const getApprovalStageColor = (stage: string): string => {
  const colors: Record<string, string> = {
    'pending_dpm': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'pending_flmi': 'bg-orange-100 text-orange-800 border-orange-200',
    'pending_pm': 'bg-blue-100 text-blue-800 border-blue-200',
    'approved': 'bg-green-100 text-green-800 border-green-200',
    'rejected': 'bg-red-100 text-red-800 border-red-200',
    'paid': 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
  return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getUserRoleFromUserRole = (userRole: string): 'program_officer' | 'deputy_manager' | 'flmi_advisor' | 'program_manager' | 'admin' => {
  const roleMap: Record<string, 'program_officer' | 'deputy_manager' | 'flmi_advisor' | 'program_manager' | 'admin'> = {
    'program_officer': 'program_officer',
    'deputy_manager': 'deputy_manager',
    'flmi_advisor': 'flmi_advisor',
    'program_manager': 'program_manager',
    'admin': 'admin'
  };
  return roleMap[userRole] || 'program_officer';
};
