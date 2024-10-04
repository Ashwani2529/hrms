import moment from 'moment';
import { attendaceGraphWeight } from 'store/constant';

// This is used to create employee's yearly attendance data
export function generateEmployeeYearlyAttendanceData(selectedEmployeeAttendance, filters) {
    const employeeAttendanceGraphData = [];
    const attendenceDateObj = {};
    let days = 365;
    if (filters?.startDate && filters.endDate) {
        const startDateInstance = moment(filters.startDate);
        const endDateInstance = moment(filters.endDate);

        days = moment.duration(endDateInstance.subtract(startDateInstance)).asDays() + 1;
    }
    if (!Array.isArray(selectedEmployeeAttendance)) {
        for (let index = 0; index < days; index += 1) {
            const currDate = moment().subtract(index, 'day');
            employeeAttendanceGraphData.push({
                date: currDate.format('YYYY-MM-DD'),
                level: 1,
                weekday: currDate.format('ddd')
            });
        }

        return employeeAttendanceGraphData;
    }

    selectedEmployeeAttendance.forEach((entry) => {
        attendenceDateObj[moment(entry.attendance_date).format('YYYY-MM-DD')] = entry.status;
    });

    const { startDate, endDate } = filters;
    if (startDate && endDate) {
        // for monthly view
        const currDate = moment(startDate).startOf('month');
        for (let index = 0; index < days; index += 1) {
            if (Object.prototype.hasOwnProperty.call(attendenceDateObj, currDate.format('YYYY-MM-DD'))) {
                employeeAttendanceGraphData.push({
                    date: currDate.format('YYYY-MM-DD'),
                    status: attendenceDateObj[currDate.format('YYYY-MM-DD')],
                    weekday: currDate.format('ddd')
                });
            } else {
                employeeAttendanceGraphData.push({
                    date: currDate.format('YYYY-MM-DD'),
                    level: 0,
                    weekday: currDate.format('ddd')
                });
            }
            currDate.add(1, 'day');
        }
    } else {
        // For yearly view
        for (let index = 0; index < days; index += 1) {
            const currDate = moment().subtract(index, 'day');
            if (Object.prototype.hasOwnProperty.call(attendenceDateObj, currDate.format('YYYY-MM-DD'))) {
                employeeAttendanceGraphData.push({
                    date: currDate.format('YYYY-MM-DD'),
                    level: attendaceGraphWeight[attendenceDateObj[currDate.format('YYYY-MM-DD')]],
                    weekday: currDate.format('ddd')
                });
            } else {
                employeeAttendanceGraphData.push({
                    date: currDate.format('YYYY-MM-DD'),
                    level: 0,
                    weekday: currDate.format('ddd')
                });
            }
        }
    }

    return employeeAttendanceGraphData;
}
