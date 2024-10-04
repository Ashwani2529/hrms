import { weekDays } from 'store/constant';

export function getMonthlyAtt({ employeeAttendanceGraphData }) {
    const obj = {};
    let weekRow = 1;
    employeeAttendanceGraphData.forEach((att) => {
        const weekLabel = `Week ${weekRow}`;
        if (obj[weekLabel]) {
            obj[weekLabel][att?.weekday] = att;
        } else {
            obj[weekLabel] = {};
            obj[weekLabel][att?.weekday] = att;
        }

        if (att?.weekday === weekDays[weekDays.length - 1]) {
            weekRow += 1;
        }
    });

    return obj;
}
