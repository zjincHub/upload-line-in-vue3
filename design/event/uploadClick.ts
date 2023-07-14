import { UPLOAD_TYPES } from './draw';

export const FUNCTION_TYPES = {
  TYPE_1: 1, // 虚线圆对应方法
  TYPE_2: 2, // 空心圆对应方法
  TYPE_3: 3, // 浅色圆对应方法
  TYPE_4: 4, // 实心圆对应方法
  TYPE_5: 5, // 虚线方块对应方法
  TYPE_7: 7, // 浅色方块对应方法
  TYPE_8: 8, // 实心方块对应方法
  TYPE_99: 99, // 组合
};

/**
 * 图例点击方法映射
 * @param history
 * @returns
 */
export function getFunctionType(history: any) {
  const result = {
    type: FUNCTION_TYPES.TYPE_99,
    history: {},
    startTime: new Date(),
    endTime: new Date(),
  };
  const combination = [
    UPLOAD_TYPES.TYPE_9,
    UPLOAD_TYPES.TYPE_10,
    UPLOAD_TYPES.TYPE_11,
  ];
  const combination12 = [UPLOAD_TYPES.TYPE_12];
  if (combination.includes(history.type)) {
    result.type = FUNCTION_TYPES.TYPE_99;
    result.startTime = history.children[0].uploadTime;
    result.endTime = history.children[history.children.length - 1].uploadTime;
  } else if ('children' in history) {
    const visualChildren = history.children.filter(
      (item: any) => !combination12.includes(item.type)
    );
    if (visualChildren.length > 1) {
      result.type = FUNCTION_TYPES.TYPE_99;
      result.startTime = history.children[0].uploadTime;
      result.endTime = history.children[history.children.length - 1].uploadTime;
    } else if (visualChildren.length === 1) {
      result.type = visualChildren[0].type;
      [result.history] = visualChildren;
    }
  } else {
    result.type = history.type;
    result.history = history;
  }
  return result;
}
