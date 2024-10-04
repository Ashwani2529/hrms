import * as moment from 'moment';

export function parseDate(
  startDate: string | null,
  endDate: string | null,
): [Date, Date] {
  let parsedStart: Date, parsedEnd: Date;

  if (startDate == null)
    parsedStart = moment(new Date()).subtract(100, 'years').toDate();
  else parsedStart = moment(startDate, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').toDate();

  if (endDate == null) parsedEnd = moment(new Date()).toDate();
  else parsedEnd = moment(endDate, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').toDate();

  return [parsedStart, parsedEnd];
}
