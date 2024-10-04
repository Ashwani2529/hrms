import { useTheme } from '@mui/system';
import moment from 'moment';
import { CalendarView, HOLIDAY_TYPES, roles } from 'store/constant';

const weekMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
};

function getRecurringDatesOfDayInAMonth(startDate, endDate, holiday, Edited, userId) {
    // this is an array that contains all the days mentioned in the WEEKOFF days array
    const recurringDays = holiday.custom_repeat;

    // This array contains the indexes of the weekdays mentioned in the custom_repeat holidays array
    const recurringDaysIndexes = recurringDays.map((day) => weekMap[day]);

    // This array will contain all the dates of the occurences of days mentioned in the custom_repeat array for the selected month
    const recurringDates = [];

    // This array will contain all the dates which have special edits being a part of WEEKOFF holidays.
    const editedDates =
        Array.isArray(Edited) &&
        Edited.map((ele) => moment(ele?.holiday_date).format('YYYY-MM-DD')).filter((date) => moment(date).isBetween(startDate, endDate));

    const currentDate = moment(startDate);

    while (currentDate.isSameOrBefore(endDate)) {
        if (currentDate.isAfter(moment(holiday?.holiday_date))) {
            // Break the loop if the end date of the holiday has passed the current date
            if (holiday?.end_date && currentDate.isAfter(moment(holiday?.end_date))) {
                break;
            }

            if (recurringDaysIndexes.includes(currentDate.day())) {
                const includedInEditedArr = editedDates.includes(currentDate.format('YYYY-MM-DD'));
                if (includedInEditedArr) {
                    // If the currentDate has a edited instance, push the edited instance for this day instead of the parent day.
                    const editedInstance = Edited.find(
                        (ele) => moment(ele?.holiday_date).format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')
                    );

                    const editedInstanceUserIds = editedInstance?.user_holiday?.map((user) => user?.user?.user_id);
                    if (editedInstance && Array.isArray(editedInstanceUserIds) && editedInstanceUserIds?.includes(userId)) {
                        recurringDates.push({
                            ...editedInstance,
                            id: editedInstance.holiday_id,
                            color: '#1ccb9e',
                            from: `${currentDate.format('YYYY-MM-DD').split('T')[0]}T00:00:00+00:00`,
                            to: `${currentDate.format('YYYY-MM-DD').split('T')[0]}T23:59:59+00:00`,
                            title: editedInstance.holiday_name
                        });
                    }
                } else {
                    // If there are no special case present for the current date then push the normal parent instance of the holiday to the recurringDates.
                    recurringDates.push({
                        ...holiday,
                        id: holiday.holiday_id,
                        color: '#1ccb9e',
                        from: `${currentDate.format('YYYY-MM-DD').split('T')[0]}T00:00:00+00:00`,
                        to: `${currentDate.format('YYYY-MM-DD').split('T')[0]}T23:59:59+00:00`,
                        title: holiday.holiday_name
                    });
                }
            }
        }
        currentDate.add(1, 'day');
    }

    return recurringDates;
}

export function parseHolidayData({ holidays = {}, selectedMonth, selectedYear, role, userId, type, activeView }) {
    const { WEEKOFF, HOLIDAY } = holidays;

    let parsedHolidays = [];

    function parseOnetimeHolidays() {
        if (Array.isArray(HOLIDAY)) {
            HOLIDAY.forEach((holiday) => {
                parsedHolidays.push({
                    ...holiday,
                    id: holiday.holiday_id,
                    color: '#fd3153',
                    from: `${holiday.holiday_date.split('T')[0]}T00:00:00+00:00`,
                    to: `${holiday.holiday_date.split('T')[0]}T23:59:59+00:00`,
                    title: holiday.holiday_name
                });
            });
        }
    }

    function parseRecurring() {
        const { Normal = [], Edited = [] } = WEEKOFF;

        if (Array.isArray(Normal)) {
            // For WEEKOFF holidays. Beware the logic is sensitive. Create a backup before doing any changes.
            // Since we are showing holidays per month, it will create all holidays on days mentioned in the WEEKOFF holiday array for the selected month of the selected year.
            if (activeView === CalendarView.CALENDAR) {
                Normal?.forEach((holiday) => {
                    if (holiday?.holiday_type === 'WEEKOFF') {
                        const startDate = moment({ year: selectedYear, month: selectedMonth, date: 1 }); // Start from the first day of the month
                        const endDate = moment(startDate).endOf('month'); // End at the last day of the month
                        parsedHolidays = [
                            ...parsedHolidays,
                            ...getRecurringDatesOfDayInAMonth(startDate, endDate, holiday, Edited, userId)
                        ];
                    } else {
                        parsedHolidays.push({
                            ...holiday,
                            holiday_type: 'WEEKOFF',
                            id: holiday?.holiday_id,
                            color: '#1ccb9e',
                            from: `${holiday.holiday_date.split('T')[0]}T00:00:00+00:00`,
                            to: `${holiday.holiday_date.split('T')[0]}T23:59:59+00:00`,
                            title: holiday.holiday_name
                        });
                    }
                });
            } else {
                Normal?.forEach((holiday) => {
                    parsedHolidays = [...parsedHolidays, holiday];
                });
            }
        }

        // Admin should be able to see all the edited dates irrespective if he/she is mentioned in the edited instance or not
        if (role === roles.ADMIN) {
            if (Array.isArray(Edited))
                Edited.forEach((ele) => {
                    parsedHolidays.push({
                        ...ele,
                        id: ele.holiday_id,
                        color: 'orange',
                        from: `${ele.holiday_date.split('T')[0]}T00:00:00+00:00`,
                        to: `${ele.holiday_date.split('T')[0]}T23:59:59+00:00`,
                        title: ele.holiday_name
                    });
                });
        }
    }

    if (type === HOLIDAY_TYPES.HOLIDAYS) {
        parseOnetimeHolidays();
    } else if (type === HOLIDAY_TYPES.WEEKOFF) {
        parseRecurring();
    } else if (type === HOLIDAY_TYPES.ALL) {
        parseOnetimeHolidays();
        parseRecurring();
    }

    return parsedHolidays;
}
