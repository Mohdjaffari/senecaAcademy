export type UserRole = "super_admin" | "principal" | "teacher" | "student" | "user";

export type Permission =
  | "students:view"
  | "students:create"
  | "students:update"
  | "students:delete"
  | "teachers:view"
  | "teachers:create"
  | "teachers:update"
  | "teachers:delete"
  | "classes:view"
  | "classes:create"
  | "classes:update"
  | "classes:delete"
  | "subjects:view"
  | "subjects:create"
  | "subjects:update"
  | "subjects:delete"
  | "attendance:view"
  | "attendance:create"
  | "attendance:update"
  | "materials:view"
  | "materials:create"
  | "materials:update"
  | "materials:delete"
  | "assignments:view"
  | "assignments:create"
  | "assignments:update"
  | "assignments:delete"
  | "assignments:grade"
  | "quizzes:view"
  | "quizzes:create"
  | "quizzes:update"
  | "quizzes:delete"
  | "quizzes:attempt"
  | "exams:view"
  | "exams:create"
  | "exams:update"
  | "exams:delete"
  | "results:view"
  | "results:create"
  | "results:update"
  | "fees:view"
  | "fees:create"
  | "fees:update"
  | "admissions:view"
  | "admissions:manage"
  | "applications:view"
  | "applications:manage"
  | "website:view"
  | "website:manage"
  | "messages:read"
  | "messages:send"
  | "auditLogs:view"
  | "settings:manage";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "students:view",
    "students:create",
    "students:update",
    "students:delete",
    "teachers:view",
    "teachers:create",
    "teachers:update",
    "teachers:delete",
    "classes:view",
    "classes:create",
    "classes:update",
    "classes:delete",
    "subjects:view",
    "subjects:create",
    "subjects:update",
    "subjects:delete",
    "attendance:view",
    "attendance:create",
    "attendance:update",
    "materials:view",
    "materials:create",
    "materials:update",
    "materials:delete",
    "assignments:view",
    "assignments:create",
    "assignments:update",
    "assignments:delete",
    "assignments:grade",
    "quizzes:view",
    "quizzes:create",
    "quizzes:update",
    "quizzes:delete",
    "quizzes:attempt",
    "exams:view",
    "exams:create",
    "exams:update",
    "exams:delete",
    "results:view",
    "results:create",
    "results:update",
    "fees:view",
    "fees:create",
    "fees:update",
    "admissions:view",
    "admissions:manage",
    "applications:view",
    "applications:manage",
    "website:view",
    "website:manage",
    "messages:read",
    "messages:send",
    "auditLogs:view",
    "settings:manage",
  ],
  principal: [
    "students:view",
    "students:create",
    "students:update",
    "students:delete",
    "teachers:view",
    "teachers:create",
    "teachers:update",
    "teachers:delete",
    "classes:view",
    "classes:create",
    "classes:update",
    "classes:delete",
    "subjects:view",
    "subjects:create",
    "subjects:update",
    "subjects:delete",
    "attendance:view",
    "attendance:create",
    "attendance:update",
    "materials:view",
    "materials:create",
    "materials:update",
    "materials:delete",
    "assignments:view",
    "assignments:create",
    "assignments:update",
    "assignments:delete",
    "assignments:grade",
    "quizzes:view",
    "quizzes:create",
    "quizzes:update",
    "quizzes:delete",
    "exams:view",
    "exams:create",
    "exams:update",
    "exams:delete",
    "results:view",
    "results:create",
    "results:update",
    "fees:view",
    "fees:create",
    "fees:update",
    "admissions:view",
    "admissions:manage",
    "applications:view",
    "applications:manage",
    "website:view",
    "website:manage",
    "messages:read",
    "messages:send",
    "auditLogs:view",
    "settings:manage",
  ],
  teacher: [
    "students:view",
    "classes:view",
    "subjects:view",
    "attendance:view",
    "attendance:create",
    "attendance:update",
    "materials:view",
    "materials:create",
    "materials:update",
    "materials:delete",
    "assignments:view",
    "assignments:create",
    "assignments:update",
    "assignments:delete",
    "assignments:grade",
    "quizzes:view",
    "quizzes:create",
    "quizzes:update",
    "quizzes:delete",
    "exams:view",
    "results:view",
    "results:create",
    "results:update",
    "messages:read",
    "messages:send",
  ],
  student: [
    "classes:view",
    "subjects:view",
    "attendance:view",
    "materials:view",
    "assignments:view",
    "quizzes:view",
    "quizzes:attempt",
    "exams:view",
    "results:view",
    "fees:view",
    "messages:read",
    "messages:send",
  ],
  user: [
    "classes:view",
    "subjects:view",
    "attendance:view",
    "materials:view",
    "assignments:view",
    "quizzes:view",
    "quizzes:attempt",
    "exams:view",
    "results:view",
    "fees:view",
    "messages:read",
    "messages:send",
    "admissions:view",
    "website:view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
