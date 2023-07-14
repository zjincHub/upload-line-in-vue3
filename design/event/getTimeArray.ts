import { TimeNode } from '../api';
import { getWeek, getFirstWeekTime } from './utils';
import CONSTANT from './constant';

/**
 * @description 获取年为单位的时间数组
 * @param {*} startTime 开始时间
 * @param {*} endTime 结束时间
 * @param {*} totalTime 开始时间到结束时间的总时长
 * @returns 返回时间间隔为年的时间数组
 */
function getYearArray(startTime: Date, endTime: Date, totalTime: number) {
  const startYear = startTime.getFullYear();
  const endYear = endTime.getFullYear();
  const yearArray = [];
  for (let i = startYear; i <= endYear; i++) {
    const yearItem: TimeNode = {};
    if (i === startYear && i === endYear) {
      yearItem.startTime = startTime;
      yearItem.endTime = endTime;
    } else if (i === startYear) {
      yearItem.startTime = startTime;
      yearItem.endTime = new Date(`${i + 1}/01/01 00:00`);
    } else if (i === endYear) {
      yearItem.startTime = new Date(`${i}/01/01 00:00`);
      yearItem.endTime = endTime;
    } else {
      yearItem.startTime = new Date(`${i}/01/01 00:00`);
      yearItem.endTime = new Date(`${i + 1}/01/01 00:00`);
    }
    yearItem.interval =
      (yearItem.endTime.getTime() - yearItem.startTime.getTime()) / totalTime;
    yearArray.push(yearItem);
  }
  return yearArray;
}

/**
 * @description 获取月为单位的时间数组
 * @param {*} startTime 开始时间
 * @param {*} endTime2 结束时间
 * @param {*} totalTime 开始时间到结束时间的总时长
 * @returns 返回时间间隔为月的时间数组
 */
function getMonthArray(startTime: Date, endTime2: Date, totalTime: number) {
  const endTime = new Date(endTime2.getTime() - 1);
  const startMonth = startTime.getMonth() + 1;
  const endMonth = endTime.getMonth() + 1;
  const monthArray = [];
  for (let i = startMonth; i <= endMonth; i++) {
    const monthItem: TimeNode = {};
    if (i === startMonth && i === endMonth) {
      monthItem.startTime = startTime;
      monthItem.endTime = endTime2;
    } else if (i === startMonth) {
      monthItem.startTime = startTime;
      monthItem.endTime = new Date(
        `${startTime.getFullYear()}/${i + 1}/01 00:00`
      );
    } else if (i === endMonth) {
      monthItem.startTime = new Date(
        `${startTime.getFullYear()}/${i}/01 00:00`
      );
      monthItem.endTime = endTime2;
    } else {
      monthItem.startTime = new Date(
        `${startTime.getFullYear()}/${i}/01 00:00`
      );
      monthItem.endTime = new Date(
        `${startTime.getFullYear()}/${i + 1}/01 00:00`
      );
    }
    monthItem.interval =
      (monthItem.endTime.getTime() - monthItem.startTime.getTime()) / totalTime;
    monthArray.push(monthItem);
  }
  return monthArray;
}

/**
 * @description 获取周为单位的时间数组
 * @param {*} startTime 开始时间
 * @param {*} endTime2 结束时间
 * @param {*} totalTime 开始时间到结束时间的总时长
 * @returns 返回时间间隔为周的时间数组
 */
function getWeekArray(startTime: Date, endTime2: Date, totalTime: number) {
  const endTime = new Date(endTime2.getTime() - 1);
  const startWeek = getWeek(startTime);
  const endWeek = getWeek(endTime);
  const weekArray = [];
  const startDay = getFirstWeekTime(startTime);
  for (let i = startWeek; i <= endWeek; i++) {
    const weekItem: TimeNode = {};
    if (i === startWeek && i === endWeek) {
      weekItem.startTime = startTime;
      weekItem.endTime = endTime2;
    } else if (i === startWeek) {
      weekItem.startTime = startTime;
      weekItem.endTime = new Date(
        startDay.getTime() + (i - 1) * CONSTANT.WEEK_TIME_LENGTH
      );
    } else if (i === endWeek) {
      weekItem.startTime = new Date(
        startDay.getTime() + (i - 2) * CONSTANT.WEEK_TIME_LENGTH
      );
      weekItem.endTime = endTime2;
    } else {
      weekItem.startTime = new Date(
        startDay.getTime() + (i - 2) * CONSTANT.WEEK_TIME_LENGTH
      );
      weekItem.endTime = new Date(
        startDay.getTime() + (i - 1) * CONSTANT.WEEK_TIME_LENGTH
      );
    }
    weekItem.interval =
      (weekItem.endTime.getTime() - weekItem.startTime.getTime()) / totalTime;
    weekArray.push(weekItem);
  }
  return weekArray;
}

/**
 * @description 获取日为单位的时间数组
 * @param {*} startTime 开始时间
 * @param {*} endTime2 结束时间
 * @param {*} totalTime 开始时间到结束时间的总时长
 * @returns 返回时间间隔为日的时间数组
 */
function getDayArray(startTime: Date, endTime2: Date, totalTime: number) {
  const endTime = new Date(endTime2.getTime() - 1);
  const year = startTime.getFullYear();
  const month = startTime.getMonth() + 1;
  const startDay = startTime.getDate();
  const endDay = endTime.getDate();
  const dayArray = [];
  for (let i = startDay; i <= endDay; i++) {
    const dayItem: TimeNode = {};
    if (i === startDay && i === endDay) {
      dayItem.startTime = startTime;
      dayItem.endTime = endTime2;
    } else if (i === startDay) {
      dayItem.startTime = startTime;
      dayItem.endTime = new Date(`${year}/${month}/${i + 1} 00:00`);
    } else if (i === endDay) {
      dayItem.startTime = new Date(`${year}/${month}/${i} 00:00`);
      dayItem.endTime = endTime2;
    } else {
      dayItem.startTime = new Date(`${year}/${month}/${i} 00:00`);
      dayItem.endTime = new Date(`${year}/${month}/${i + 1} 00:00`);
    }
    dayItem.interval =
      (dayItem.endTime.getTime() - dayItem.startTime.getTime()) / totalTime;
    dayArray.push(dayItem);
  }
  return dayArray;
}

/**
 * @description 获取小时为单位的时间数组
 * @param {*} startTime 开始时间
 * @param {*} endTime2 结束时间
 * @param {*} totalTime 开始时间到结束时间的总时长
 * @returns 返回时间间隔为小时的时间数组
 */
function getHourArray(startTime: Date, endTime2: Date, totalTime: number) {
  const endTime = new Date(endTime2.getTime() - 1);
  const year = startTime.getFullYear();
  const month = startTime.getMonth() + 1;
  const day = startTime.getDate();
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const hourArray = [];
  for (let i = startHour; i <= endHour; i++) {
    const hourItem: TimeNode = {};
    if (i === startHour && i === endHour) {
      hourItem.startTime = startTime;
      hourItem.endTime = endTime2;
    } else if (i === startHour) {
      hourItem.startTime = startTime;
      hourItem.endTime = new Date(`${year}/${month}/${day} ${i + 1}:00`);
    } else if (i === endHour) {
      hourItem.startTime = new Date(`${year}/${month}/${day} ${i}:00`);
      hourItem.endTime = endTime2;
    } else {
      hourItem.startTime = new Date(`${year}/${month}/${day} ${i}:00`);
      hourItem.endTime = new Date(`${year}/${month}/${day} ${i + 1}:00`);
    }
    hourItem.interval =
      (hourItem.endTime.getTime() - hourItem.startTime.getTime()) / totalTime;
    hourArray.push(hourItem);
  }
  return hourArray;
}

/**
 * @description 获取不同时间单位的数组
 * @returns 返回时间间隔分别为年/月/日/小时的时间数组
 */
export default function getTimeArray(
  startTime: Date,
  endTime: Date,
  totalTime: number
) {
  const yearArray: TimeNode[] = getYearArray(startTime, endTime, totalTime);
  let monthArray: TimeNode[] = [];
  let weekArray: TimeNode[] = [];
  let dayArray: TimeNode[] = [];
  let hourArray: TimeNode[] = [];
  yearArray.forEach((item) => {
    if (item.startTime && item.endTime) {
      monthArray = [
        ...monthArray,
        ...getMonthArray(item.startTime, item.endTime, totalTime),
      ];
      weekArray = [
        ...weekArray,
        ...getWeekArray(item.startTime, item.endTime, totalTime),
      ];
    }
  });
  monthArray.forEach((item) => {
    if (item.startTime && item.endTime) {
      dayArray = [
        ...dayArray,
        ...getDayArray(item.startTime, item.endTime, totalTime),
      ];
    }
  });
  dayArray.forEach((item) => {
    if (item.startTime && item.endTime) {
      hourArray = [
        ...hourArray,
        ...getHourArray(item.startTime, item.endTime, totalTime),
      ];
    }
  });
  return {
    yearArray,
    monthArray,
    weekArray,
    dayArray,
    hourArray,
  };
}
