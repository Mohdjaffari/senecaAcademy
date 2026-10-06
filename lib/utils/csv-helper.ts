/**
 * Seneca Academy LMS - RFC-4180 Compliant CSV Helper Suite
 * Handles robust parsing, escaping, export with UTF-8 BOM, and import templates.
 */

export interface CSVParseResult {
  headers: string[];
  normalizedHeaders: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
  errors: string[];
}

export interface CSVColumnDefinition {
  label: string;
  key: string;
  required?: boolean;
  example?: string;
  description?: string;
}

/**
 * Strips UTF-8 BOM and parses raw CSV string according to RFC-4180 standard.
 * Properly parses quoted fields, escaped double quotes, and multi-line strings.
 */
export function parseCSV(csvText: string): CSVParseResult {
  const result: CSVParseResult = {
    headers: [],
    normalizedHeaders: [],
    rows: [],
    rawRows: [],
    errors: [],
  };

  if (!csvText || !csvText.trim()) {
    result.errors.push("The uploaded CSV file is empty.");
    return result;
  }

  // Strip UTF-8 Byte Order Mark (BOM) if present
  let cleanText = csvText;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  // RFC-4180 State Machine Tokenizer
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" inside quotes becomes a single quote
          currentField += '"';
          i++; // skip next quote
        } else {
          // End of quoted block
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++; // Skip \n in CRLF
        }
        currentRow.push(currentField.trim());
        currentField = "";
        if (currentRow.some((f) => f.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        currentField = "";
        if (currentRow.some((f) => f.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  // Push final field and row if any remained
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    result.errors.push("No valid data rows found in CSV.");
    return result;
  }

  // First line is headers
  const rawHeaders = lines[0];
  result.headers = rawHeaders;
  result.normalizedHeaders = rawHeaders.map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  result.rawRows = lines.slice(1);

  // Map subsequent lines to key-value objects
  for (let r = 0; r < result.rawRows.length; r++) {
    const rowValues = result.rawRows[r];
    const rowObj: Record<string, string> = {};

    for (let c = 0; c < result.headers.length; c++) {
      const headerKey = result.normalizedHeaders[c] || `col_${c}`;
      rowObj[headerKey] = (rowValues[c] ?? "").trim();
      // Also preserve original case label for display
      rowObj[result.headers[c]] = (rowValues[c] ?? "").trim();
    }

    result.rows.push(rowObj);
  }

  return result;
}

/**
 * Exports data to a clean CSV file and triggers an instant client download.
 * Adds UTF-8 BOM so Microsoft Excel renders Urdu/Arabic/Special chars flawlessly.
 */
export function exportToCSV(
  filename: string,
  columns: { label: string; key?: string; accessor?: (row: any) => any }[],
  data: any[]
): void {
  if (!data || data.length === 0) {
    return;
  }

  const headerRow = columns
    .map((c) => `"${(c.label || "").replace(/"/g, '""')}"`)
    .join(",");

  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let val: any = "";
        if (col.accessor) {
          val = col.accessor(item);
        } else if (col.key && item[col.key] !== undefined && item[col.key] !== null) {
          val = item[col.key];
        }

        // Format dates, booleans, objects
        if (val instanceof Date) {
          val = val.toISOString().slice(0, 10);
        } else if (typeof val === "boolean") {
          val = val ? "Yes" : "No";
        } else if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }

        const strVal = String(val ?? "").replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(",");
  });

  // UTF-8 BOM prefix (\uFEFF) ensures Excel opens with proper UTF-8 encoding
  const csvContent = "\uFEFF" + [headerRow, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a pre-formatted sample CSV template for import workflows.
 */
export function downloadSampleCSVTemplate(
  filename: string,
  columns: CSVColumnDefinition[],
  sampleRows: Record<string, string>[]
): void {
  const headers = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
  
  const rows = sampleRows.map((sample) => {
    return columns
      .map((c) => {
        const val = sample[c.key] || sample[c.label] || c.example || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// Predefined Official Templates for Seneca LMS
// ==========================================

export const STUDENT_IMPORT_COLUMNS: CSVColumnDefinition[] = [
  { label: "Student Name", key: "name", required: true, example: "Muhammad Hamza", description: "Full student legal name" },
  { label: "Student Email", key: "email", required: false, example: "hamza.26@seneca.edu.pk", description: "Unique portal login email (Auto-generated if blank)" },
  { label: "Roll Number", key: "rollNumber", required: false, example: "09-A-15", description: "Classroom roll identifier (Auto-assigned if blank)" },
  { label: "Admission Number", key: "admissionNumber", required: false, example: "SEN-2026-101", description: "Official institutional ID (Auto-generated if blank)" },
  { label: "Class Name", key: "className", required: true, example: "Grade 9", description: "Grade/Tier (e.g. Playgroup, Grade 1, Grade 9, 1st Year)" },
  { label: "Section", key: "section", required: true, example: "A", description: "Class section (e.g. A, B, C, Cambridge)" },
  { label: "Academic Track / Specialization", key: "stream", required: false, example: "Matric Science", description: "Academic Specialization & Study Track (e.g. FSc Pre-Medical, ICS, Cambridge O-Levels, General)" },
  { label: "Gender", key: "gender", required: false, example: "Male", description: "Male, Female, or Other" },
  { label: "Date of Birth", key: "dateOfBirth", required: false, example: "2010-04-12", description: "YYYY-MM-DD" },
  { label: "B-Form / CNIC", key: "bFormNumber", required: false, example: "42101-1234567-1", description: "NADRA B-Form or Child ID" },
  { label: "Blood Group", key: "bloodGroup", required: false, example: "B+", description: "Blood group (A+, B+, O+, AB+, etc.)" },
  { label: "Father Name", key: "fatherName", required: true, example: "Muhammad Tariq", description: "Father or guardian full legal name" },
  { label: "Father CNIC", key: "fatherCnic", required: false, example: "42101-9876543-1", description: "Father NADRA CNIC number" },
  { label: "Parent Phone", key: "parentPhone", required: true, example: "+92 300 1234567", description: "Primary parent contact mobile" },
  { label: "Emergency Contact", key: "emergencyContact", required: false, example: "+92 321 7654321", description: "Secondary contact phone" },
  { label: "Address", key: "address", required: false, example: "Block 4, Clifton, Karachi", description: "Residential home address" },
  { label: "Admission Type", key: "admissionType", required: false, example: "Regular", description: "Regular, Transfer, Sibling, Scholarship, or Provisional" },
  { label: "Fee Category", key: "feeCategory", required: false, example: "Standard", description: "Standard, Sibling Discount (20%), Merit Scholarship (50%), Full Scholarship (100%), Need-Based Concession" },
  { label: "Transport Route", key: "transportRoute", required: false, example: "Route 1: Soldier Bazar", description: "Bus transport route or Self Pick & Drop" },
  { label: "Previous School", key: "previousSchool", required: false, example: "Karachi Grammar School", description: "Previous school name or SLC institution" },
];

export const STUDENT_SAMPLE_DATA: Record<string, string>[] = [
  {
    name: "Ayaan Ahmed Khan",
    email: "ayaan.khan26@seneca.edu.pk",
    rollNumber: "NUR-01",
    admissionNumber: "SEN-2026-091",
    className: "Nursery",
    section: "A",
    stream: "General Curriculum",
    gender: "Male",
    dateOfBirth: "2022-04-12",
    bFormNumber: "42101-1122334-1",
    bloodGroup: "B+",
    fatherName: "Tariq Ahmed Khan",
    fatherCnic: "42101-8877665-1",
    parentPhone: "+92 300 1122334",
    emergencyContact: "+92 300 9988776",
    address: "Block 4, Clifton, Karachi",
    admissionType: "Regular",
    feeCategory: "Standard",
    transportRoute: "Route 1: Soldier Bazar • Garden East",
    previousSchool: "First Step Preschool",
  },
  {
    name: "Zainab Fatima",
    email: "zainab.fatima26@seneca.edu.pk",
    rollNumber: "05-B-12",
    admissionNumber: "SEN-2026-092",
    className: "Grade 5",
    section: "B",
    stream: "General Curriculum (National Standards)",
    gender: "Female",
    dateOfBirth: "2015-07-28",
    bFormNumber: "42101-2233445-2",
    bloodGroup: "O+",
    fatherName: "Dr. Farhan Siddiqui",
    fatherCnic: "42101-5544332-1",
    parentPhone: "+92 321 4455667",
    emergencyContact: "+92 321 8899001",
    address: "Model Town, Lahore",
    admissionType: "Sibling",
    feeCategory: "Sibling Discount (20%)",
    transportRoute: "Route 2: PECHS • Tariq Road",
    previousSchool: "Beaconhouse School System",
  },
  {
    name: "Muhammad Bilal",
    email: "bilal.tariq26@seneca.edu.pk",
    rollNumber: "09-A-04",
    admissionNumber: "SEN-2026-093",
    className: "Grade 9",
    section: "A",
    stream: "Matric Science (Biology, Chemistry, Physics)",
    gender: "Male",
    dateOfBirth: "2011-09-15",
    bFormNumber: "42201-3344556-3",
    bloodGroup: "A+",
    fatherName: "Tariq Mehmood",
    fatherCnic: "42201-6677889-1",
    parentPhone: "+92 333 5566778",
    emergencyContact: "+92 333 1122334",
    address: "Gulberg III, Lahore",
    admissionType: "Regular",
    feeCategory: "Standard",
    transportRoute: "Self Pick & Drop (No School Transport)",
    previousSchool: "Seneca Academy Middle Wing",
  },
  {
    name: "Sarah Rehman",
    email: "sarah.rehman26@seneca.edu.pk",
    rollNumber: "11-MED-08",
    admissionNumber: "SEN-2026-094",
    className: "1st Year",
    section: "A",
    stream: "FSc Pre-Medical (Biology, Chemistry, Physics)",
    gender: "Female",
    dateOfBirth: "2009-02-18",
    bFormNumber: "42101-7788990-2",
    bloodGroup: "AB+",
    fatherName: "Engr. Abdul Rehman",
    fatherCnic: "42101-1199887-1",
    parentPhone: "+92 345 6677889",
    emergencyContact: "+92 345 9900112",
    address: "DHA Phase 5, Karachi",
    admissionType: "Scholarship",
    feeCategory: "Merit Scholarship (50%)",
    transportRoute: "Route 4: Saddar • Clifton • DHA",
    previousSchool: "The City School (Matric Board: 94%)",
  },
];

export const CLASS_IMPORT_COLUMNS: CSVColumnDefinition[] = [
  { label: "Class Name", key: "name", required: true, example: "Grade 6", description: "Academic class level (e.g. Nursery, Grade 6)" },
  { label: "Section", key: "section", required: true, example: "A", description: "Section identifier (e.g. A, B, Cambridge)" },
  { label: "Grade Level", key: "gradeLevel", required: true, example: "6", description: "Integer grade level (0 for Nursery/KG, 1-12 for Grades)" },
  { label: "Stream", key: "stream", required: false, example: "General", description: "Academic stream" },
  { label: "Capacity", key: "capacity", required: false, example: "35", description: "Maximum student capacity" },
  { label: "Room Number", key: "roomNumber", required: false, example: "Room-204", description: "Classroom room number or hall" },
];

export const CLASS_SAMPLE_DATA: Record<string, string>[] = [
  {
    name: "Nursery",
    section: "A",
    gradeLevel: "0",
    stream: "General",
    capacity: "25",
    roomNumber: "Early-Wings-101",
  },
  {
    name: "Grade 7",
    section: "Cambridge",
    gradeLevel: "7",
    stream: "Cambridge International",
    capacity: "30",
    roomNumber: "Hall-B",
  },
];

export const SUBJECT_IMPORT_COLUMNS: CSVColumnDefinition[] = [
  { label: "Subject Name", key: "name", required: true, example: "Advanced Physics & Laboratory", description: "Official curriculum course title" },
  { label: "Subject Code", key: "code", required: false, example: "PHY-901", description: "Institutional course code (Auto-generated if blank)" },
  { label: "Department", key: "department", required: false, example: "Pure Sciences & Research", description: "Academic department / faculty alignment" },
  { label: "Credit Hours", key: "creditHours", required: false, example: "4", description: "Weekly instructional periods or credit hours (Default: 3)" },
  { label: "Applicable Classes", key: "classNames", required: false, example: "Grade 9-A; Grade 9-B; Grade 10-A", description: "Semicolon or comma-separated list of classes offering this subject" },
  { label: "Assigned Teachers", key: "teachers", required: false, example: "Mr. Farhan Tariq; Ms. Sajida", description: "Optional specialist faculty names or employee IDs" },
  { label: "Description", key: "description", required: false, example: "Mechanics, thermodynamics, and experimental laboratory sessions.", description: "Curriculum scope and course overview" },
];

export const SUBJECT_SAMPLE_DATA: Record<string, string>[] = [
  {
    name: "Early Childhood Phonics & Interactive Storytelling",
    code: "ENG-001",
    department: "Early Childhood & Montessori",
    creditHours: "5",
    classNames: "Playgroup-A; Nursery-A; Prep-A",
    teachers: "Ms. Sajida Parveen",
    description: "Foundational phonics, English alphabet sound recognition, and sensory vocabulary.",
  },
  {
    name: "Cambridge Primary Mathematics",
    code: "MTH-301",
    department: "Mathematics & Computing",
    creditHours: "5",
    classNames: "Grade 3-A; Grade 4-A; Grade 5-A",
    teachers: "Sir Muhammad Bilal",
    description: "Numeracy, mental arithmetic, geometry, and real-world mathematical reasoning.",
  },
  {
    name: "Secondary Physics & Laboratory Practicals",
    code: "PHY-901",
    department: "Pure Sciences & Research",
    creditHours: "4",
    classNames: "Grade 9-A; Grade 9-B; Grade 10-A",
    teachers: "Dr. Farhan Siddiqui",
    description: "Newtonian mechanics, wave theory, electromagnetism, and hands-on lab experiments.",
  },
  {
    name: "FSc Pre-Medical Biology & Human Anatomy",
    code: "BIO-1101",
    department: "Medical & Life Sciences",
    creditHours: "6",
    classNames: "1st Year-A; 2nd Year-A",
    teachers: "Dr. Farhan Siddiqui; Ms. Zainab Fatima",
    description: "Cellular biology, genetics, human physiology, and college-level biological dissection.",
  },
];

export const TEACHER_IMPORT_COLUMNS: CSVColumnDefinition[] = [
  { label: "Full Name", key: "name", required: true, example: "Ms. Sajida Parveen", description: "Faculty legal name" },
  { label: "Faculty Email", key: "email", required: true, example: "sajida@seneca.edu.pk", description: "Faculty portal login email" },
  { label: "Phone Number", key: "phone", required: true, example: "+92 300 1234567", description: "Contact number" },
  { label: "Employee ID", key: "employeeId", required: false, example: "TCH-2026-015", description: "Institutional employee ID" },
  { label: "Specialization", key: "specialization", required: true, example: "Early Childhood Education", description: "Academic subject specialty" },
  { label: "Qualification", key: "qualification", required: true, example: "M.Ed Early Years", description: "Degree or certification" },
  { label: "Experience Years", key: "experienceYears", required: false, example: "6", description: "Years in teaching" },
];

export const TEACHER_SAMPLE_DATA: Record<string, string>[] = [
  {
    name: "Ms. Sajida Parveen",
    email: "sajida.faculty@seneca.edu.pk",
    phone: "+92 300 7766554",
    employeeId: "TCH-2026-008",
    specialization: "Early Childhood Development",
    qualification: "M.A. Education",
    experienceYears: "5",
  },
];
