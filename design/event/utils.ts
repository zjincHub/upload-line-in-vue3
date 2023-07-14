import CONSTANT from './constant';

/**
 * @description 获取当前年第一个周一
 * @param {*} time 时间
 * @returns 返回Date
 */
export function getFirstWeekTime(time: Date) {
  const year = time.getFullYear();
  const firstDay = new Date(`${year}/01/01 00:00`);
  const firstWeekNum = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const startDay =
    firstWeekNum === 1
      ? firstDay
      : new Date(`${year}/01/${9 - firstWeekNum} 00:00`);
  return startDay;
}

/**
 * @description 根据时间计算当前时间是一年中的第几周
 * @param {*} time 时间
 * @returns 返回第几周
 */
export function getWeek(time: Date) {
  const startDay = getFirstWeekTime(time);
  let weekNum = 1;
  if (time.getTime() >= startDay.getTime()) {
    weekNum =
      Math.floor(
        (time.getTime() - startDay.getTime()) / CONSTANT.WEEK_TIME_LENGTH
      ) + 2;
  }
  return weekNum;
}

/**
 * @description 时间格式转换成 yyyy/mm/dd
 * @param {*} time 时间
 */
export function formateDate(time: Date) {
  const year = time.getFullYear();
  const month =
    time.getMonth() > 8 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`;
  const day = time.getDate() > 9 ? time.getDate() : `0${time.getDate()}`;
  return `${year}/${month}/${day}`;
}

/**
 * @description 从DATA中获取开始和结束时间（如果没有，设置默认时间）
 * @returns 返回包含开始时间和结束时间的数组
 */
export function getStartEndTime(data: any) {
  let startTime: Date | null = null;
  let endTime: Date | null = null;
  data.forEach((item: any) => {
    if (item?.uploadHistory?.length > 0) {
      item.uploadHistory.forEach((fileItem: any) => {
        if (startTime) {
          startTime =
            startTime.getTime() < fileItem.uploadTime.getTime()
              ? startTime
              : fileItem.uploadTime;
        } else {
          startTime = fileItem.uploadTime;
        }
        if (endTime) {
          endTime =
            endTime.getTime() > fileItem.uploadTime.getTime()
              ? endTime
              : fileItem.uploadTime;
        } else {
          endTime = fileItem.uploadTime;
        }
      });
    }
  });
  if (!startTime) startTime = new Date('2023/01/01 00:00');
  if (!endTime) endTime = new Date();
  if (startTime.getTime() === endTime.getTime()) {
    startTime = new Date(startTime.getTime() - 3600000);
    endTime = new Date(endTime.getTime() + 3600000);
  }
  return [startTime, endTime];
}

/**
 *
 * @param {*} time DATE信息
 * @param {*} timeType 时间类型
 * @returns 返回显示在时间线上的时间文本
 */
export function getTimeText(time: Date, timeType: string) {
  let text = '';
  if (timeType === 'year') {
    text = `${time.getFullYear()}年`;
  } else if (timeType === 'month') {
    text = `${time.getMonth() + 1}月`;
  } else if (timeType === 'week') {
    text = `${getWeek(time)}周`;
  } else if (timeType === 'day') {
    text = formateDate(time);
  } else if (timeType === 'hour') {
    text = `${time.getHours()}`;
  }
  return text;
}
