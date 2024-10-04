export const attendanceStatuses = {
    NO_DATA: 'NO_DATA',
    ABSENT: 'ABSENT',
    PRESENT: 'PRESENT',
    HALF_DAY: 'HALF_DAY',
    SICK_LEAVE: 'SICK LEAVE',
    CASUAL_LEAVE: 'CASUAL LEAVE',
    EARNED_LEAVE: 'EARNED LEAVE',
    COMPUNSATORY_LEAVE: 'COMPUNSATORY LEAVE',
    OVERTIME: 'OVER_TIME',
    HOLIDAY: 'HOLIDAY',
    WEEKOFF: 'WEEKOFF'
};

export const attendanceGraphColors = {
    [attendanceStatuses.NO_DATA]: '#e5e5e5',
    [attendanceStatuses.ABSENT]: '#CF2F3C',
    [attendanceStatuses.PRESENT]: '#23CF3F',
    [attendanceStatuses.HALF_DAY]: '#FAB600',
    [attendanceStatuses.CASUAL_LEAVE]: '#9AA2E0',
    [attendanceStatuses.SICK_LEAVE]: '#4BBDE0',
    [attendanceStatuses.EARNED_LEAVE]: '#E041DB',
    [attendanceStatuses.COMPUNSATORY_LEAVE]: '#111',
    [attendanceStatuses.OVERTIME]: '#6A2ADB',
    [attendanceStatuses.HOLIDAY]: '#fd3153',
    [attendanceStatuses.WEEKOFF]: '#BDE038'
};

export const attendaceGraphWeight = {
    [attendanceStatuses.NO_DATA]: 0,
    [attendanceStatuses.ABSENT]: 1,
    [attendanceStatuses.PRESENT]: 2,
    [attendanceStatuses.HALF_DAY]: 3,
    [attendanceStatuses.CASUAL_LEAVE]: 4,
    [attendanceStatuses.SICK_LEAVE]: 5,
    [attendanceStatuses.EARNED_LEAVE]: 6,
    [attendanceStatuses.COMPUNSATORY_LEAVE]: 7,
    [attendanceStatuses.OVERTIME]: 8,
    [attendanceStatuses.HOLIDAY]: 9,
    [attendanceStatuses.WEEKOFF]: 10
};

export const MusterStatuses = {
    [attendanceStatuses.NO_DATA]: '',
    [attendanceStatuses.ABSENT]: 'A',
    [attendanceStatuses.PRESENT]: 'P',
    [attendanceStatuses.HALF_DAY]: 'H',
    [attendanceStatuses.CASUAL_LEAVE]: 'CL',
    [attendanceStatuses.SICK_LEAVE]: 'SL',
    [attendanceStatuses.EARNED_LEAVE]: 'EL',
    [attendanceStatuses.COMPUNSATORY_LEAVE]: 'CPL',
    [attendanceStatuses.OVERTIME]: 'O',
    [attendanceStatuses.HOLIDAY]: 'H',
    [attendanceStatuses.WEEKOFF]: 'W'
};

export const monthsArr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
