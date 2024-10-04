// theme constant
export * from './constants/attendance.constants';
export * from './constants/holiday.constants';
export * from './constants/payroll.constants';
export * from './constants/docusign.constants';

export const gridSpacing = 3;
export const drawerWidth = 260;
export const appDrawerWidth = 320;
export const roles = {
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMP',
    HR: 'HR'
};

export const LeaveTypes = {
    SICK: 'SICK',
    CASUAL: 'CASUAL',
    EARNED: 'EARNED',
    COMPUNSATORY: 'COMPUNSATORY'
};

export const REMARK_TYPE = {
    PERFORMANCE: 'PERFORMANCE',
    CONFLICT: 'CONFLICT'
};

export const REQUEST_TYPE = {
    ATTENDANCE_CORRECTION: 'ATTENDANCE CORRECTION'
};

export const TIKCET_TYPE = {
    COMPLAINT: 'COMPLAINT'
};
