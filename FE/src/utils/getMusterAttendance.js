import moment from 'moment';
import { attendanceStatuses, CalendarView, HOLIDAY_TYPES, roles } from 'store/constant';
import { parseHolidayData } from './parseHolidayData';

export async function getMusterAttendance({
    currMonthDates = [],
    attendances = [],
    liveEmployees = [],
    holidays = {},
    leaves = [],
    shifts = []
}) {
    const liveEmployeesIds = liveEmployees?.map((emp) => emp?.user_id);

    return new Promise((resolve, reject) => {
        const parsedAttendance = {};

        // Initialize every employee details as key and assign am empty array to it
        liveEmployees.forEach((emp) => {
            parsedAttendance[emp?.user_id] = {};

            // Logic to include holidays assigned to each specific user
            const userHolidays = parseHolidayData({
                activeView: CalendarView.CALENDAR,
                role: roles.ADMIN,
                selectedMonth: moment(currMonthDates[0]).get('month'),
                selectedYear: moment(currMonthDates[0]).get('year'),
                type: HOLIDAY_TYPES.ALL,
                userId: '',
                holidays
            });

            if (Array.isArray(userHolidays)) {
                userHolidays.forEach((holiday) => {
                    if (Array.isArray(holiday?.user_holiday)) {
                        holiday?.user_holiday?.forEach((ele) => {
                            const date = moment(holiday?.from);
                            // if (parsedAttendance[ele?.user?.user_id] && moment().isBefore(date)) {
                            if (parsedAttendance[ele?.user?.user_id]) {
                                parsedAttendance[ele?.user?.user_id][date.format('YYYY-MM-DD')] = {
                                    status: holiday?.holiday_type === 'HOLIDAY' ? attendanceStatuses.HOLIDAY : attendanceStatuses.WEEKOFF,
                                    shift: null
                                };
                            }
                        });
                    }
                });
            }

            // Logic to include leaves assinged to each specific user
            if (Array.isArray(leaves)) {
                leaves
                    .filter((leave) => leave?.leave_status === 'APPROVED')
                    .forEach((leave) => {
                        if (!leave?.leave_start_date || !leave?.leave_end_date) return;
                        // get the days of the leaves using startdate and endate
                        const leaveDates = [];
                        const date = moment(leave?.leave_start_date);
                        while (date.isSameOrBefore(moment(leave?.leave_end_date))) {
                            leaveDates.push(date.format('YYYY-MM-DD'));
                            date.add(1, 'day');
                        }
                        if (parsedAttendance[leave?.user?.user_id]) {
                            leaveDates.forEach((entry) => {
                                const date = moment(entry);
                                if (moment().isBefore(date)) {
                                    parsedAttendance[leave?.user?.user_id][date.format('YYYY-MM-DD')] = {
                                        status: leave?.leave_type,
                                        shift: null
                                    };
                                }
                            });
                        }
                    });
            }
        });

        attendances.forEach((attendance) => {
            const user = parsedAttendance[attendance?.user?.user_id];
            if (!user) return;

            // Populate the available attendnces
            const date = moment(attendance?.attendance_date).format('YYYY-MM-DD');
            user[date] = attendance;
        });

        // Iterate over each user
        Object.keys(parsedAttendance).forEach((userKey) => {
            // Check if there is any object already assigned to the date key. If there is not, assign a status of "attendanceStatuses.NO_DATA" to such dates which represent NO_DATA
            currMonthDates.forEach((date) => {
                const user = parsedAttendance[userKey];
                if (user && !user[date]) {
                    user[date] = {
                        status: attendanceStatuses.NO_DATA,
                        // Initialise the shift property with null value which will be replaced later by the shift object if it exists for the user at the selected date
                        shift: null
                    };
                }
            });
        });

        // For including shits data in the employee attendance object
        shifts.forEach((shift) => {
            const shiftEmployeeIds = Array.isArray(shift?.user_shift) ? shift?.user_shift?.map((user) => user?.user?.user_id) : [];

            shiftEmployeeIds?.forEach((empId) => {
                if (!liveEmployeesIds.includes(empId)) return;
                const shiftStartDate = moment(shift?.start_time).format('YYYY-MM-DD');
                if (parsedAttendance[empId] && parsedAttendance[empId][shiftStartDate] && !parsedAttendance[empId][shiftStartDate].shift) {
                    parsedAttendance[empId][shiftStartDate].shift = shift;
                }
            });
        });

        resolve(parsedAttendance);
    });
}
