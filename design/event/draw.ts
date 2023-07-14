import CONSTANT from './constant';

export const UPLOAD_TYPES = {
  TYPE_1: 1, // 虚线圆
  TYPE_2: 2, // 空心圆
  TYPE_3: 3, // 浅色圆
  TYPE_4: 4, // 实心圆
  TYPE_5: 5, // 虚线方块
  TYPE_6: 6, // 空心方块
  TYPE_7: 7, // 浅色方块
  TYPE_8: 8, // 实心方块
  TYPE_9: 9, // 双色圆
  TYPE_10: 10, // 双色鼓形
  TYPE_11: 11, // 实心鼓形
  TYPE_12: 12, // 消失
};

/**
 * 绘制数字角标
 * @param ele
 */
export function drawMark(ele: HTMLElement) {
  ele.style.top = `${-CONSTANT.MARK_TEXT_SIZE}px`;
  ele.style.left = `${CONSTANT.RECT_WIDTH / 2}px`;
  ele.style.backgroundColor = CONSTANT.MARK_BACKGROUND_COLOR;
  ele.style.color = CONSTANT.MARK_TEXT_COLOR;
  ele.style.fontSize = `${CONSTANT.MARK_TEXT_SIZE}px`;
  ele.style.position = 'absolute';
  ele.style.padding = CONSTANT.MARK_TEXT_SIZE > 10 ? '2px 6px' : '0px 6px';
  ele.style.borderRadius = '10px';
  ele.style.border = '2px solid #FFFFFF';
  ele.style.transition = 'opacity 0.2s ease-out';
  ele.style.opacity = '0';
}

/**
 * 计算角标值
 * @param historyList
 * @returns number
 */
export function getMarkText(historyList: any[]) {
  const combination12 = [UPLOAD_TYPES.TYPE_12];
  const result = historyList.filter(
    (item) => !combination12.includes(item.type)
  );
  return result.length;
}

/**
 * 图例出现时的动画
 * @param ele
 * @param height
 * @param width
 */
function afterAnimation(ele: HTMLElement, height: number, width: number) {
  setTimeout(() => {
    ele.style.width = `${width}px`;
    ele.style.height = `${height}px`;
    const mark: any = ele.children[0];
    if (mark) {
      mark.style.opacity = '1';
    }
  });
}

/**
 * 绘制虚线圆
 * @param ele
 * @param color
 */
function drawDottedCircle(ele: HTMLElement, color: string) {
  ele.style.backgroundColor = 'white';
  ele.style.border = `2px dotted ${color}`;
  ele.style.borderRadius = '50%';
  afterAnimation(ele, CONSTANT.CIRCLE_DIAMETER, CONSTANT.CIRCLE_DIAMETER);
}

/**
 * 绘制空心圆
 * @param ele
 * @param color
 */
function drawHollowCircle(ele: HTMLElement, color: string) {
  ele.style.backgroundColor = 'white';
  ele.style.border = `2px solid ${color}`;
  ele.style.borderRadius = '50%';
  afterAnimation(ele, CONSTANT.CIRCLE_DIAMETER, CONSTANT.CIRCLE_DIAMETER);
}

/**
 * 绘制浅色圆
 * @param ele
 * @param color
 * @param colorArray
 */
function drawLightColorCircle(
  ele: HTMLElement,
  color: string,
  colorArray: number[]
) {
  ele.style.backgroundColor = `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, 0.5)`;
  ele.style.border = `2px solid ${color}`;
  ele.style.borderRadius = '50%';
  afterAnimation(ele, CONSTANT.CIRCLE_DIAMETER, CONSTANT.CIRCLE_DIAMETER);
}

/**
 * 绘制实心圆
 * @param ele
 * @param color
 */
function drawSolidCircle(ele: HTMLElement, color: string) {
  ele.style.backgroundColor = color;
  ele.style.borderRadius = '50%';
  afterAnimation(ele, CONSTANT.CIRCLE_DIAMETER, CONSTANT.CIRCLE_DIAMETER);
}

/**
 * 绘制双色圆
 * @param ele
 * @param color
 */
function drawDoubleColorCircle(ele: HTMLElement, color: string) {
  ele.style.background = `linear-gradient(to right, ${color} 0%,${color} 50%,white 50%,white 100%)`;
  ele.style.border = `2px solid ${color}`;
  ele.style.borderRadius = '50%';
  afterAnimation(ele, CONSTANT.CIRCLE_DIAMETER, CONSTANT.CIRCLE_DIAMETER);
}

/**
 * 绘制虚线方块
 * @param ele
 * @param color
 */
function drawDottedRect(ele: HTMLElement, color: string) {
  ele.style.backgroundColor = 'white';
  ele.style.border = `2px dotted ${color}`;
  ele.style.borderRadius = '4px';
  afterAnimation(ele, CONSTANT.RECT_WIDTH, CONSTANT.RECT_WIDTH);
}

/**
 * 绘制空心方块
 * @param ele
 * @param color
 */
function drawHollowRect(ele: HTMLElement, color: string) {
  ele.style.backgroundColor = 'white';
  ele.style.border = `2px solid ${color}`;
  ele.style.borderRadius = '4px';
  afterAnimation(ele, CONSTANT.RECT_WIDTH, CONSTANT.RECT_WIDTH);
}

/**
 * 绘制浅色方块
 * @param ele
 * @param color
 * @param colorArray
 */
function drawLightColorRect(
  ele: HTMLElement,
  color: string,
  colorArray: number[]
) {
  ele.style.backgroundColor = `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, 0.5)`;

  ele.style.border = `2px solid ${color}`;
  ele.style.borderRadius = '4px';
  afterAnimation(ele, CONSTANT.RECT_WIDTH, CONSTANT.RECT_WIDTH);
}

/**
 * 绘制实心方块
 * @param ele
 * @param color
 */
function drawSolidRect(ele: HTMLElement, color: string) {
  ele.style.backgroundColor = color;
  ele.style.borderRadius = '4px';
  afterAnimation(ele, CONSTANT.RECT_WIDTH, CONSTANT.RECT_WIDTH);
}

/**
 * 绘制双色鼓形
 * @param ele
 * @param color
 */
function drawDoubleColorDrum(ele: HTMLElement, color: string) {
  ele.style.background = `linear-gradient(to right, ${color} 0%,${color} 50%,white 50%,white 100%)`;
  ele.style.border = `2px solid ${color}`;
  ele.style.borderRadius = '40%';
  afterAnimation(ele, CONSTANT.DRUM_HEIGHT, CONSTANT.DRUM_WIDTH);
}

/**
 * 绘制实心鼓形
 * @param ele
 * @param color
 */
function drawSolidDrum(ele: HTMLElement, color: string) {
  ele.style.backgroundColor = color;
  ele.style.borderRadius = '40%';
  afterAnimation(ele, CONSTANT.DRUM_HEIGHT, CONSTANT.DRUM_WIDTH);
}

/**
 * 不可见
 * @param ele
 */
function disappear(ele: HTMLElement) {
  ele.style.display = 'none';
}

/**
 * 更新交付计划图形
 * @param ele
 * @param left
 * @param height
 */
export function updatePlanEvent(
  ele: HTMLElement,
  left: number,
  height: number
) {
  ele.style.left = `${left}px`;
  const svgELe = ele.children[0] as SVGElement;
  if (height + 30 !== svgELe.clientHeight) {
    svgELe.setAttribute('viewBox', `-2 -2 16 ${height + 30}`);
    svgELe.setAttribute('height', `${height + 30}`);
    svgELe.children[1].setAttribute(
      'points',
      `6,${height + 18},2,${height + 24},10,${height + 24}`
    );
    svgELe.children[2].setAttribute('y2', `${height + 14}`);
  }
}

/**
 * 绘制交付计划
 * @param ele
 * @param left
 * @param height
 */
export function drawPlanEvent(
  ele: HTMLElement,
  left: number,
  height: number,
  history: any,
  bubblePosition: any,
  bubbleText: any
) {
  ele.style.left = `${left}px`;
  ele.style.top = `0`;
  ele.style.position = 'absolute';
  ele.style.transition = 'opacity 0.2s ease-out';
  ele.style.opacity = '0';
  ele.style.marginTop = '-14px';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg: SVGElement = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', `${height + 30}`);
  svg.setAttribute('viewBox', `-2 -2 16 ${height + 30}`);
  const polygon1 = document.createElementNS(SVG_NS, 'polygon');
  polygon1.setAttribute('stroke-linejoin', 'round');
  polygon1.setAttribute('points', '2,0,10,0,6,6');
  polygon1.setAttribute('fill', '#86909c');
  polygon1.setAttribute('stroke', '#86909c');
  polygon1.setAttribute('stroke-width', '4');
  const polygon2 = document.createElementNS(SVG_NS, 'polygon');
  polygon2.setAttribute('stroke-linejoin', 'round');
  polygon2.setAttribute(
    'points',
    `6,${height + 18},2,${height + 24},10,${height + 24}`
  );
  polygon2.setAttribute('fill', '#86909c');
  polygon2.setAttribute('stroke', '#86909c');
  polygon2.setAttribute('stroke-width', '4');
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('stroke', '#86909c');
  line.setAttribute('stroke-width', '1');
  line.setAttribute('x1', '6');
  line.setAttribute('y1', '10');
  line.setAttribute('x2', '6');
  line.setAttribute('y2', `${height + 14}`);
  svg.appendChild(polygon1);
  svg.appendChild(polygon2);
  svg.appendChild(line);
  ele.appendChild(svg);
  ele.addEventListener('mouseenter', (event: MouseEvent) => {
    const { target }: any = event;
    const leftValue = parseInt(target.style.left.replace('px', ''), 10);
    const topValue = parseInt(target.style.top.replace('px', ''), 10);
    bubblePosition.value = [`${leftValue + 5}px`, `${topValue - 16}px`];
    bubbleText.value = history.name;
  });
  ele.addEventListener('mouseleave', () => {
    bubblePosition.value = ['0', '0'];
  });
  setTimeout(() => {
    ele.style.opacity = `1`;
  });
}

export function eventMouseEnter(
  event: MouseEvent,
  ele: HTMLElement,
  color: string,
  history: any,
  bubblePosition: any,
  bubbleText: any
) {
  const { target }: any = event;
  const leftValue = parseInt(target.style.left.replace('px', ''), 10);
  const topValue = parseInt(target.style.top.replace('px', ''), 10);
  bubblePosition.value = [`${leftValue + 10}px`, `${topValue - 10}px`];
  ele.style.boxShadow = `0 0 0 1px white, 0 0 0 2px ${color}`;
  let bubbleTextStr = '';
  if (history.children?.length > 0) {
    let sharedNumber = 0;
    let deliveryNumber = 0;
    history.children.forEach((item: any) => {
      if (item.type >= 1 && item.type <= 4) {
        sharedNumber += 1;
      } else if (item.type >= 5 && item.type <= 8) {
        deliveryNumber += 1;
      }
    });
    const sharedStr = sharedNumber > 0 ? `${sharedNumber}个共享包` : '';
    const deliveryStr = deliveryNumber > 0 ? `${deliveryNumber}个交付包` : '';
    bubbleTextStr = `${sharedStr} ${deliveryStr}`;
  } else {
    bubbleTextStr = history.name;
  }
  bubbleText.value = bubbleTextStr;
}

/**
 * 绘制各种图例
 * @param ele
 * @param left
 * @param index
 * @param color
 * @param type
 */
export function drawEvent(
  ele: HTMLElement,
  left: number,
  index: number,
  color: string,
  type: number,
  history: any,
  bubblePosition: any,
  bubbleText: any
) {
  const eventTop =
    (index * 2 + 1.5) * CONSTANT.LINE_HEIGHT -
    CONSTANT.RECT_WIDTH / 2 +
    CONSTANT.LINE_WEIGHT / 2;
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);
  ele.style.left = `${left}px`;
  ele.style.top = `${eventTop}px`;
  ele.style.position = 'absolute';
  ele.style.transition = 'height 0.2s ease-out, width 0.2s ease-out';
  ele.style.cursor = 'pointer';
  ele.style.width = '0';
  ele.style.height = '0';
  ele.onmouseenter = (event: MouseEvent) => {
    eventMouseEnter(event, ele, color, history, bubblePosition, bubbleText);
  };
  ele.addEventListener('mouseleave', () => {
    ele.style.boxShadow = '';
    bubblePosition.value = ['0', '0'];
  });
  switch (type) {
    case UPLOAD_TYPES.TYPE_1:
      drawDottedCircle(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_2:
      drawHollowCircle(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_3:
      drawLightColorCircle(ele, color, [red, green, blue]);
      break;
    case UPLOAD_TYPES.TYPE_4:
      drawSolidCircle(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_5:
      drawDottedRect(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_6:
      drawHollowRect(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_7:
      drawLightColorRect(ele, color, [red, green, blue]);
      break;
    case UPLOAD_TYPES.TYPE_8:
      drawSolidRect(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_9:
      drawDoubleColorCircle(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_10:
      drawDoubleColorDrum(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_11:
      drawSolidDrum(ele, color);
      break;
    case UPLOAD_TYPES.TYPE_12:
      disappear(ele);
      break;
    default:
      disappear(ele);
  }
}

/**
 * 自己团队upload图例类型计算
 * @param typeA
 * @param typeB
 * @returns
 */
function getSelfTeamUploadType(typeA: number, typeB: number) {
  let result = UPLOAD_TYPES.TYPE_12;
  const combination11 = [
    UPLOAD_TYPES.TYPE_4,
    UPLOAD_TYPES.TYPE_8,
    UPLOAD_TYPES.TYPE_11,
  ];
  if (typeA === typeB) {
    result = typeA;
  } else if (combination11.includes(typeA) && combination11.includes(typeB)) {
    result = UPLOAD_TYPES.TYPE_11;
  } else if (typeA === UPLOAD_TYPES.TYPE_8 || typeB === UPLOAD_TYPES.TYPE_8) {
    result = UPLOAD_TYPES.TYPE_8;
  } else if (typeA === UPLOAD_TYPES.TYPE_4 || typeB === UPLOAD_TYPES.TYPE_4) {
    result = UPLOAD_TYPES.TYPE_4;
  } else if (typeA === UPLOAD_TYPES.TYPE_7 || typeB === UPLOAD_TYPES.TYPE_7) {
    result = UPLOAD_TYPES.TYPE_7;
  } else if (typeA === UPLOAD_TYPES.TYPE_3 || typeB === UPLOAD_TYPES.TYPE_3) {
    result = UPLOAD_TYPES.TYPE_3;
  } else if (typeA === UPLOAD_TYPES.TYPE_5 || typeB === UPLOAD_TYPES.TYPE_5) {
    result = UPLOAD_TYPES.TYPE_5;
  } else if (typeA === UPLOAD_TYPES.TYPE_1 || typeB === UPLOAD_TYPES.TYPE_1) {
    result = UPLOAD_TYPES.TYPE_1;
  } else {
    result = UPLOAD_TYPES.TYPE_12;
  }
  return result;
}

/**
 * 其他团队upload图例类型计算
 * @param typeA
 * @param typeB
 * @returns
 */
function getOtherTeamUploadType(typeA: number, typeB: number) {
  let result = UPLOAD_TYPES.TYPE_12;
  const combination9 = [
    UPLOAD_TYPES.TYPE_2,
    UPLOAD_TYPES.TYPE_4,
    UPLOAD_TYPES.TYPE_9,
  ];
  const combination11 = [
    UPLOAD_TYPES.TYPE_4,
    UPLOAD_TYPES.TYPE_8,
    UPLOAD_TYPES.TYPE_11,
  ];
  const combination10 = [
    UPLOAD_TYPES.TYPE_2,
    UPLOAD_TYPES.TYPE_8,
    UPLOAD_TYPES.TYPE_10,
  ];
  if (typeA === typeB) {
    result = typeA;
  } else if (combination9.includes(typeA) && combination9.includes(typeB)) {
    result = UPLOAD_TYPES.TYPE_9;
  } else if (combination11.includes(typeA) && combination11.includes(typeB)) {
    result = UPLOAD_TYPES.TYPE_11;
  } else if (combination10.includes(typeA) && combination10.includes(typeB)) {
    result = UPLOAD_TYPES.TYPE_10;
  } else if (typeA === UPLOAD_TYPES.TYPE_10) {
    result = UPLOAD_TYPES.TYPE_10;
  } else if (typeA === UPLOAD_TYPES.TYPE_11 && typeB === UPLOAD_TYPES.TYPE_2) {
    result = UPLOAD_TYPES.TYPE_10;
  } else if (typeA === UPLOAD_TYPES.TYPE_9 && typeB === UPLOAD_TYPES.TYPE_8) {
    result = UPLOAD_TYPES.TYPE_10;
  } else if (typeB === UPLOAD_TYPES.TYPE_8) {
    result = UPLOAD_TYPES.TYPE_8;
  } else if (typeB === UPLOAD_TYPES.TYPE_4) {
    result = UPLOAD_TYPES.TYPE_4;
  } else if (typeB === UPLOAD_TYPES.TYPE_2) {
    result = UPLOAD_TYPES.TYPE_2;
  } else if (typeA === UPLOAD_TYPES.TYPE_12) {
    result = typeB;
  } else if (typeB === UPLOAD_TYPES.TYPE_12) {
    result = typeA;
  } else {
    result = UPLOAD_TYPES.TYPE_12;
  }
  return result;
}

/**
 * 获取要展示的upload图例的map
 * @param uploadHistory
 * @param times
 * @param totalTime
 * @param canvasWidth
 * @param isSelfTeam
 * @returns
 */
export function getUploadMap(
  uploadHistory: any[],
  times: number,
  totalTime: number,
  canvasWidth: number,
  isSelfTeam: boolean
) {
  const result = new Map();
  const timeList = [];
  const getTypeFunction = isSelfTeam
    ? getSelfTeamUploadType
    : getOtherTeamUploadType;
  for (let i = 0; i < uploadHistory.length; i++) {
    if (i === 0) {
      result.set(uploadHistory[i].uploadTime, uploadHistory[i]);
      timeList.push(uploadHistory[i].uploadTime);
    } else {
      const uploadTimeA: Date = timeList[timeList.length - 1];
      const uploadTimeB: Date = uploadHistory[i].uploadTime;
      const timeDiff =
        (((uploadTimeB.getTime() - uploadTimeA.getTime()) / totalTime) *
          canvasWidth) /
        times;
      if (
        timeDiff <= CONSTANT.MERGING_DISTANCE &&
        !('children' in result.get(uploadTimeA))
      ) {
        // 还没有children属性
        const type = getTypeFunction(
          result.get(uploadTimeA).type,
          uploadHistory[i].type
        );
        const newHistory = {
          uploadTime: uploadTimeA,
          type,
          children: [result.get(uploadTimeA), uploadHistory[i]],
        };
        result.set(uploadTimeA, newHistory);
      } else if (
        timeDiff <= CONSTANT.MERGING_DISTANCE &&
        'children' in result.get(uploadTimeA)
      ) {
        // 已经有children属性
        const type = getTypeFunction(
          result.get(uploadTimeA).type,
          uploadHistory[i].type
        );
        result.get(uploadTimeA).children.push(uploadHistory[i]);
        result.get(uploadTimeA).type = type;
      } else {
        result.set(uploadHistory[i].uploadTime, uploadHistory[i]);
        timeList.push(uploadHistory[i].uploadTime);
      }
    }
  }
  return result;
}
