import  {timeToMinutes} from './utils/overlap.js';

export const timeOverlap=(firstStart, firstEnd, secondStart, secondEnd) => {
    return timeToMinutes(firstStart) < timeToMinutes(secondEnd) && timeToMinutes(secondStart) < timeToMinutes(firstEnd);
};