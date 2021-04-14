import { Event } from './models';
import dayjs from 'dayjs';


export class EventHelper extends Event {

    static computeDateEnd(start, duration, format = '') {
        const dateEnd = EventHelper.dateFormat(dayjs(start).add(duration, 'minute'), format);
        return dateEnd;
    }

    static computeDuration(dateStart, dateEnd) {
        const end = dayjs(dateEnd);
        return end.diff(dateStart, 'minute');
    }

    static dateFormat(date, format = '') {
        return dayjs(date).format(format);
    }
}
