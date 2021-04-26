import { Event } from './models';
import dayjs from 'dayjs';


export class EventHelper extends Event {

    static dateFormat(date, format = '') {
        return dayjs(date).format(format);
    }

    /*
     * Description.
     * Format date to client side pages
     */
    static dateFormatClient(date, format = 'ddd DD YYYY HH:mm') {
        return dayjs(date).format(format);
    }
}
