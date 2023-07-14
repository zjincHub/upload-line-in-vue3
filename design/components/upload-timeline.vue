<template>
  <div class="upline-timeline-drawer">
    <div class="upline-drawer-body">
      <div
        ref="docTimelineLegend"
        class="upline-timeline-legend"
        @scroll="teamBoxScrollHandle"
      >
        <a-tooltip
          v-for="(item, index) in allData"
          :key="index"
          :content="item.name"
        >
          <div
            class="upline-selectable"
            :style="'background-color:' + item.color"
          >
            <div class="team-name">
              <div v-if="index === 0" class="current-team">
                <currentTeamSvg
                  :style="'width: ' + (CONSTANT.LINE_HEIGHT - 6) + 'px'"
                />
              </div>
              <div
                v-if="index !== 0 && teamAttentionList.includes(item.id)"
                class="attention-team"
              >
                <img
                  :style="'width: ' + (CONSTANT.LINE_HEIGHT - 12) + 'px'"
                  src="@/assets/images/design/attention.png"
                />
              </div>
              <div
                v-if="index !== 0 && selfTeams.findIndex((itm:any) => itm.id === item.id) !== -1"
                class="self-team"
              >
              </div>
              <div class="team-name-text">{{ item.name }}</div>
            </div>
            <div class="dropdown-button">
              <a-dropdown @select="teamOperation($event, item)" @click.stop>
                <icon-more-vertical />
                <template #content>
                  <a-doption
                    v-if="index !== 0 && selfTeams.findIndex((itm:any) => itm.id === item.id) !== -1"
                    value="setCurrent"
                  >
                    <template #icon>
                      <icon-subscribe />
                    </template>
                    <template #default>
                      <span>设为当前团队</span>
                    </template>
                  </a-doption>
                  <a-doption value="attention">
                    <template #icon>
                      <icon-star />
                    </template>
                    <template #default
                      ><span>
                        {{
                          teamAttentionList.includes(item.id)
                            ? '取消关注'
                            : '关注'
                        }}</span
                      ></template
                    >
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>
        </a-tooltip>
      </div>
    </div>
    <div class="upline-pull-tab">
      <div
        ref="docTimelineCanvas"
        class="upline-timeline-canvas"
        @wheel.capture="canvasScroll"
      >
        <div ref="docTimelineLeft"></div>
        <canvas ref="docCanvas" @mousedown="canvasClick"></canvas>
        <div ref="docTimelineRight"></div>
      </div>
      <div class="upline-scroll-bar">
        <div
          class="upline-scroll-button upline-clickable upline-go-left"
          @click="goFarLeftOrRight(1)"
        >
          <img src="@/assets/images/design/goFarLeft.png" />
        </div>
        <div
          class="upline-scroll-button upline-clickable upline-go-left"
          @click="goLeftOrRight(1)"
        >
          <img src="@/assets/images/design/goLeft.png" />
        </div>
        <div ref="docSlider" class="upline-slider">
          <div
            ref="docLeftDrag"
            class="upline-left-drag upline-scroll-button upline-clickable"
          >
            <div class="line"></div>
          </div>
          <div ref="docGrip" class="upline-grip upline-clickable"></div>
          <div
            ref="docRightDrag"
            class="upline-right-drag upline-scroll-button upline-clickable"
          >
            <div class="line"></div>
          </div>
          <div ref="docLeftDragTime" class="upline-left-drag-time"></div>
          <div ref="docRightDragTime" class="upline-right-drag-time"></div>
        </div>
        <div
          class="upline-scroll-button upline-clickable upline-go-right"
          @click="goLeftOrRight(2)"
        >
          <img src="@/assets/images/design/goRight.png" />
        </div>
        <div
          class="upline-scroll-button upline-clickable upline-go-right"
          @click="goFarLeftOrRight(2)"
        >
          <img src="@/assets/images/design/goFarRight.png" />
        </div>
      </div>
    </div>
    <div
      class="bubble"
      :style="
        'left: ' +
        bubblePosition[0] +
        '; top: ' +
        bubblePosition[1] +
        '; display: ' +
        bubbleShow +
        '; opacity: ' +
        bubbleOpacity
      "
    >
      <div class="cont">{{ bubbleText }}</div>
      <div class="triangle"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    onMounted,
    ref,
    watch,
    onBeforeUnmount,
    nextTick,
    computed,
  } from 'vue';
  import { useThrottleFn, useDebounceFn } from '@vueuse/core';
  import currentTeamSvg from '@/assets/images/design/currentTeam.svg';
  import { TimeNode, TimeListTypes } from '../api';
  import getTimeArray from '../event/getTimeArray';
  import { formateDate, getStartEndTime, getTimeText } from '../event/utils';
  import CONSTANT from '../event/constant';
  import {
    drawMark,
    drawEvent,
    getUploadMap,
    UPLOAD_TYPES,
    getMarkText,
    drawPlanEvent,
    updatePlanEvent,
    eventMouseEnter,
  } from '../event/draw';
  import { FUNCTION_TYPES, getFunctionType } from '../event/uploadClick';

  const props = defineProps({
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    allData: {
      type: Array<any>,
      default() {
        return [];
      },
    },
    planData: {
      type: Array,
      default() {
        return [];
      },
    },
    teamAttentionList: {
      type: Array,
      default() {
        return [];
      },
    },
    selfTeams: {
      type: Array,
      default() {
        return [];
      },
    },
    currentTeamId: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits([
    'setTeamAttention',
    'checkCurrentTeam',
    'sharedTobeReviewed',
    'otherTeamShared',
    'sharedInWip',
    'saveDelivery',
    'deliveryTobeReviewed',
    'deliveryInWip',
    'saveShared',
    'changeFilterData',
  ]);

  const teamOperation = (val: any, teamData: any) => {
    if (val === 'setCurrent') {
      emit('checkCurrentTeam', teamData);
    } else if (val === 'attention') {
      emit('setTeamAttention', teamData);
    }
  };

  // 根据DATA计算得出的常量
  let START_TIME: Date; // 最先上传时间
  let END_TIME: Date; // 最后上传时间
  let TOTAL_TIME: number; // 上传时间总间隔
  let EACH_TIME_ARRAY: TimeListTypes; // 分别以年/月/日/小时为单位分割时间线得到的数组

  // html元素
  const docCanvas = ref<any>();
  const docCtx = ref<any>();
  const docTimelineCanvas = ref<any>();
  const docLeftDrag = ref<any>();
  const docRightDrag = ref<any>();
  const docGrip = ref<any>();
  const docSlider = ref<any>();
  const docTimelineLegend = ref<any>();
  const docLeftDragTime = ref<any>();
  const docRightDragTime = ref<any>();
  const docTimelineLeft = ref<any>();
  const docTimelineRight = ref<any>();

  // 变量
  let left = 0; // 左侧拖动按钮位置百分比
  let right = 1; // 右侧拖动按钮位置百分比
  let draglayerX = 0; // 中间滑块鼠标按下时偏移量
  let leftTime: Date; // 左侧拖动按钮表示时间
  let rightTime: Date; // 右侧拖动按钮表示时间
  let smallMarginLeft = 0;
  let smallMarginRight = 0;

  const eventMap = new Map(); // 存放event
  const planMap = new Map(); // 存放plan

  const lineHeight = computed(() => {
    return `${CONSTANT.LINE_HEIGHT}px`;
  });
  const lineWeight = computed(() => {
    return `${CONSTANT.LINE_WEIGHT}px`;
  });

  const teamBoxHeight = computed(() => {
    return `${CONSTANT.LINE_HEIGHT * (props.data.length * 2 + 1)}px`;
  });
  const teamBoxScroll = computed(() => {
    return props.allData.length > props.data.length && props.data.length !== 1
      ? 'scroll'
      : 'hidden';
  });

  const DATA = ref<any[]>([]);
  const PLAN_DATA = ref<any[]>([]);

  const bubblePosition = ref(['0', '0']);
  const bubbleText = ref('');
  const bubbleShow = computed(() => {
    return bubblePosition.value[0] !== '0' && bubblePosition.value[1] !== '0'
      ? 'block'
      : 'none';
  });
  const bubbleOpacity = ref(0);
  watch(
    bubbleShow,
    (value: string) => {
      if (value === 'block') {
        setTimeout(() => {
          bubbleOpacity.value = 1;
        }, 100);
      } else {
        bubbleOpacity.value = 0;
      }
    },
    {
      immediate: true,
    }
  );

  const currentTeamColor = ref('#fff');

  const teamBoxScrollHandle = useDebounceFn((event: UIEvent) => {
    const { target }: any = event;
    const sliceVal = Math.floor(
      (target.scrollTop + CONSTANT.LINE_HEIGHT) / CONSTANT.LINE_HEIGHT / 2
    );
    emit('changeFilterData', sliceVal);
  }, 300);

  /**
   * 初始化画布两边背景
   */
  function setCanvasMarginBackground() {
    while (docTimelineLeft?.value?.children?.length > 0) {
      docTimelineLeft?.value?.children[0].remove();
    }
    while (docTimelineRight?.value?.children.length > 0) {
      docTimelineRight?.value?.children[0].remove();
    }
    for (let i = 0; i < DATA.value.length; i++) {
      const line1 = document.createElement('div');
      line1.style.height = `${CONSTANT.LINE_WEIGHT}px`;
      line1.style.width = `${CONSTANT.LINE_MARGIN}px`;
      line1.style.backgroundColor = DATA.value[i].color;
      line1.style.marginTop =
        i === 0
          ? `${1.5 * CONSTANT.LINE_HEIGHT}px`
          : `${2 * CONSTANT.LINE_HEIGHT - CONSTANT.LINE_WEIGHT}px`;
      docTimelineLeft?.value?.appendChild(line1);
      const line2 = document.createElement('div');
      line2.style.height = `${CONSTANT.LINE_WEIGHT}px`;
      line2.style.width = `${CONSTANT.LINE_MARGIN}px`;
      line2.style.backgroundColor = DATA.value[i].color;
      line2.style.marginTop =
        i === 0
          ? `${1.5 * CONSTANT.LINE_HEIGHT}px`
          : `${2 * CONSTANT.LINE_HEIGHT - CONSTANT.LINE_WEIGHT}px`;
      docTimelineRight?.value?.appendChild(line2);
    }
  }

  /**
   * 初始化画布和滚动条
   */
  function initCanvasAndScroll() {
    // 初始化画布两边背景
    setCanvasMarginBackground();
    // 初始化画布
    docCanvas.value.height = (2 * DATA.value.length + 1) * CONSTANT.LINE_HEIGHT;
    docCanvas.value.width =
      (docTimelineCanvas?.value?.clientWidth as number) -
      CONSTANT.LINE_MARGIN * 2; // 40为side背景宽度
    // 滑块区域宽度
    const sliderWidth = docSlider?.value?.offsetWidth;
    // 初始化可视化组件
    docRightDrag.value.style.left = `${sliderWidth}px`;
    docLeftDrag.value.style.left = '0';
    docGrip.value.style.left = '0';
    docGrip.value.style.width = `${sliderWidth}px`;
  }

  /**
   * 绘制矩形（背景-时间）
   * @param {*} offset 偏移量（百分比）
   * @param {*} times 放大倍数
   * @param {*} timeArray 时间间隔数组
   * @param {*} timeType 时间类型（年/月/日/小时）
   */
  function drawRect(
    offset: number,
    times: number,
    timeArray: TimeNode[],
    timeType: string
  ) {
    let leftPointer = 0;
    for (let i = 0; i < timeArray.length; i++) {
      const rectWidth =
        ((docCanvas?.value?.width as number) *
          (timeArray[i].interval as number)) /
        times;
      const rectLeft =
        leftPointer - (offset * (docCanvas?.value?.width as number)) / times;
      // 判断是否在绘制区域内（性能优化）
      if (
        rectLeft < docCanvas?.value?.width &&
        rectLeft > -(docCanvas?.value?.width as number)
      ) {
        // 绘制rect
        docCtx.value.fillStyle =
          i % 2 === 0
            ? CONSTANT.BACKGROUND_COLOR_1
            : CONSTANT.BACKGROUND_COLOR_2;
        docCtx.value.fillRect(rectLeft, 0, rectWidth, docCanvas?.value?.height);
        // 绘制时间text
        docCtx.value.fillStyle = 'rgb(187, 187, 187)';
        docCtx.value.font = `${CONSTANT.TIME_TEXT_SIZE}px Arial`;
        const text = getTimeText(timeArray[i].startTime as Date, timeType);
        const textWidth = docCtx?.value?.measureText(text).width;
        // 判断react长度够不够显示text
        if (textWidth < rectWidth) {
          const textTop =
            DATA.value.length % 2 === 0
              ? (DATA.value.length + 0.5) * CONSTANT.LINE_HEIGHT +
                CONSTANT.TIME_TEXT_SIZE / 2
              : (DATA.value.length - 0.5) * CONSTANT.LINE_HEIGHT +
                CONSTANT.TIME_TEXT_SIZE / 2;
          docCtx?.value?.fillText(
            text,
            rectLeft + rectWidth / 2 - textWidth / 2,
            textTop
          );
        }
      }
      leftPointer += rectWidth;
    }
  }

  /**
   * 绘制时间线
   */
  function drawLine() {
    DATA.value.forEach((item: any, index: number) => {
      docCtx?.value?.beginPath();
      docCtx?.value?.moveTo(
        0,
        (2 * index + 1.5) * CONSTANT.LINE_HEIGHT + CONSTANT.LINE_WEIGHT / 2
      );
      docCtx?.value?.lineTo(
        docCanvas?.value?.width,
        (2 * index + 1.5) * CONSTANT.LINE_HEIGHT + CONSTANT.LINE_WEIGHT / 2
      );
      docCtx.value.lineWidth = 2;
      docCtx.value.strokeStyle = item.color;
      docCtx.value.setLineDash([5, 10, 20]);
      docCtx.value.lineDashOffset = -50;
      docCtx.value.stroke();
    });
  }

  /**
   * 设置leftDrag的时间点
   */
  function setLeftDragTime() {
    leftTime = new Date(START_TIME.getTime() + left * TOTAL_TIME);
    docLeftDragTime.value.innerText = formateDate(leftTime);
    docLeftDragTime.value.style.left = docLeftDrag?.value?.style.left;
  }

  /**
   * 设置rightDrag的时间点
   */
  function setRightDragTime() {
    rightTime = new Date(START_TIME.getTime() + right * TOTAL_TIME);
    docRightDragTime.value.innerText = formateDate(rightTime);
    docRightDragTime.value.style.left = docRightDrag?.value?.style.left;
  }

  let draw: any;

  /**
   * 根据left和right值重新绘制
   */
  function redrawByLeftAndRight() {
    const sliderWidth = docSlider.value.offsetWidth;
    docGrip.value.style.left = `${sliderWidth * left - smallMarginLeft}px`;
    docGrip.value.style.width = `${
      sliderWidth * (right - left) - smallMarginRight + smallMarginLeft
    }px`;
    docLeftDrag.value.style.left = `${sliderWidth * left - smallMarginLeft}px`;
    docRightDrag.value.style.left = `${
      sliderWidth * right - smallMarginRight
    }px`;
    draw(left, right - left);
  }

  /**
   * 组合图标点击事件
   * @param timeA
   * @param timeB
   */
  function combinationEventClick(timeA: Date, timeB: Date) {
    smallMarginLeft = 0;
    smallMarginRight = 0;
    const sliderWidth = docSlider.value.offsetWidth;
    left = (timeA.getTime() - START_TIME.getTime()) / TOTAL_TIME;
    right = (timeB.getTime() - START_TIME.getTime()) / TOTAL_TIME;
    const rightMin =
      (timeA.getTime() -
        START_TIME.getTime() +
        CONSTANT.HOUR_TIME_LENGTH / CONSTANT.MAX_VIEW_PROPORTION) /
      TOTAL_TIME;

    if ((right - left) * sliderWidth < 20)
      smallMarginRight = (right - left) * sliderWidth - 20;
    if (rightMin > right) right = rightMin;

    redrawByLeftAndRight();
  }

  /**
   * 设置图例的点击方法
   * @param ele
   * @param history
   */
  function setFunction(ele: HTMLElement, history: any) {
    const type = getFunctionType(history);
    if (type.type === FUNCTION_TYPES.TYPE_99) {
      ele.onclick = () => combinationEventClick(type.startTime, type.endTime);
    } else if (type.type === FUNCTION_TYPES.TYPE_1) {
      ele.onclick = () => emit('saveShared', type.history);
    } else if (type.type === FUNCTION_TYPES.TYPE_2) {
      ele.onclick = () => emit('otherTeamShared', type.history);
    } else if (type.type === FUNCTION_TYPES.TYPE_3) {
      ele.onclick = () => emit('sharedTobeReviewed', type.history);
    } else if (type.type === FUNCTION_TYPES.TYPE_4) {
      ele.onclick = () => emit('sharedInWip', type.history);
    } else if (type.type === FUNCTION_TYPES.TYPE_5) {
      ele.onclick = () => emit('saveDelivery', type.history);
    } else if (type.type === FUNCTION_TYPES.TYPE_7) {
      ele.onclick = () => emit('deliveryTobeReviewed', type.history);
    } else if (type.type === FUNCTION_TYPES.TYPE_8) {
      ele.onclick = () => emit('deliveryInWip', type.history);
    }
  }

  /**
   * 绘制里程碑
   */
  function drawPlan() {
    const totalTime = rightTime.getTime() - leftTime.getTime();
    PLAN_DATA.value.forEach((plan: any) => {
      const planItem = planMap.get(plan.uploadTime);
      if (plan.uploadTime >= leftTime && plan.uploadTime <= rightTime) {
        const marginLeft =
          (plan.uploadTime.getTime() - leftTime.getTime()) / totalTime;
        const eventLeft =
          marginLeft * (docCanvas?.value?.width as number) +
          CONSTANT.LINE_MARGIN -
          CONSTANT.RECT_WIDTH / 2;
        if (planItem) {
          // 更新
          updatePlanEvent(planItem, eventLeft, docCanvas?.value?.height);
        } else {
          // 如果planMap中没有，则创建一个
          const newPlan = document.createElement('div');
          // 绘制
          drawPlanEvent(
            newPlan,
            eventLeft,
            docCanvas?.value?.height,
            plan,
            bubblePosition,
            bubbleText
          );
          docTimelineCanvas?.value?.appendChild(newPlan);
          planMap.set(plan.uploadTime, newPlan);
        }
      } else if (planItem) {
        planItem.style.opacity = '0';
        planMap.set(plan.uploadTime, null);
        setTimeout(() => {
          planItem.remove();
        }, 200);
      }
    });
  }

  /**
   * 绘制上传的文件
   */
  function drawUpload(times: number) {
    const totalTime = rightTime.getTime() - leftTime.getTime();
    const historyMapKeys: Date[] = [];
    DATA.value.forEach((team: any, index: number) => {
      team.historyMap = getUploadMap(
        team.uploadHistory,
        times,
        TOTAL_TIME,
        docCanvas?.value?.width,
        team.id === props.currentTeamId
      );
      team.historyMap.forEach((history: any, key: Date) => {
        const eventItem = eventMap.get(history.uploadTime);
        historyMapKeys.push(history.uploadTime);
        // 在显示范围内
        if (history.uploadTime >= leftTime && history.uploadTime <= rightTime) {
          const marginLeft =
            (history.uploadTime.getTime() - leftTime.getTime()) / totalTime;
          const eventLeft =
            marginLeft * (docCanvas?.value?.width as number) +
            CONSTANT.LINE_MARGIN -
            CONSTANT.RECT_WIDTH / 2;
          const childrenLength =
            'children' in history && getMarkText(history.children);
          // 维护eventMap
          if (eventItem) {
            eventItem.style.left = `${eventLeft}px`;
            // 如果形状变化 重新绘制
            const beforeHistory = team.beforeHistoryMap?.get(key);
            if (beforeHistory?.type !== history.type) {
              eventItem.style.width = '0';
              eventItem.style.height = '0';
              const mark: any = eventItem.children[0];
              if (mark) {
                mark.style.opacity = '0';
              }
              setTimeout(() => {
                eventItem.remove();
              }, 200);
              const event = document.createElement('div');
              // 绘制
              drawEvent(
                event,
                eventLeft,
                index,
                team.color,
                history.type,
                history,
                bubblePosition,
                bubbleText
              );
              // 添加事件
              setFunction(event, history);
              docTimelineCanvas?.value?.appendChild(event);
              eventMap.set(history.uploadTime, event);
              if (
                history.type !== UPLOAD_TYPES.TYPE_12 &&
                childrenLength &&
                childrenLength > 1
              ) {
                const newMark = document.createElement('div');
                drawMark(newMark);
                newMark.innerHTML = `${childrenLength}`;
                event.appendChild(newMark);
              }
            } else {
              // 形状没有变化
              // 如果元素上没有mark，新数据又有children，则新增mark
              if (
                !eventItem.children[0] &&
                childrenLength &&
                childrenLength > 1
              ) {
                const mark = document.createElement('div');
                // 绘制
                drawMark(mark);
                mark.innerHTML = `${childrenLength}`;
                eventItem.appendChild(mark);
                setTimeout(() => {
                  mark.style.opacity = '1';
                });
              }
              // 如果元素上有mark，新数据没有children，则移除mark
              if (
                (!childrenLength || childrenLength === 1) &&
                eventItem.children[0]
              ) {
                eventItem.children[0].remove();
              }
              // 如果元素上有mark，新数据也有children，则更新数量
              if (
                'children' in history &&
                childrenLength &&
                childrenLength > 1
              ) {
                eventItem.children[0].innerHTML = `${childrenLength}`;
              }
              // 添加事件
              setFunction(eventItem, history);
            }
            eventItem.onmouseenter = (event: MouseEvent) => {
              eventMouseEnter(
                event,
                eventItem,
                team.color,
                history,
                bubblePosition,
                bubbleText
              );
            };
          } else {
            // 如果eventMap中没有，则创建一个
            const event = document.createElement('div');
            // 绘制
            drawEvent(
              event,
              eventLeft,
              index,
              team.color,
              history.type,
              history,
              bubblePosition,
              bubbleText
            );
            // 添加事件
            setFunction(event, history);

            docTimelineCanvas?.value?.appendChild(event);
            eventMap.set(history.uploadTime, event);

            if ('children' in history && childrenLength && childrenLength > 1) {
              const mark = document.createElement('div');
              drawMark(mark);
              mark.innerHTML = `${childrenLength}`;
              event.appendChild(mark);
            }
          }
        } else if (eventItem) {
          // 不在显示范围内
          eventItem.style.width = '0';
          eventItem.style.height = '0';
          const mark: any = eventItem.children[0];
          if (mark) {
            mark.style.opacity = '0';
          }
          eventMap.set(history.uploadTime, null);
          setTimeout(() => {
            eventItem.remove();
          }, 200);
        }
      });
      team.beforeHistoryMap = new Map([...team.historyMap.entries()]);
    });
    eventMap.forEach((event: any, key: Date) => {
      if (!historyMapKeys.includes(key) && event) {
        const ele = event;
        ele.style.width = '0';
        ele.style.height = '0';
        const mark: any = ele.children[0];
        if (mark) {
          mark.style.opacity = '0';
        }
        eventMap.set(key, null);
        setTimeout(() => {
          ele.remove();
        }, 200);
      }
    });
  }

  /**
   * 绘制图像
   * @param {*} offset 偏移量（百分比）
   * @param {*} times 放大倍数
   */
  draw = (offset: number, times: number) => {
    docCtx?.value?.clearRect(
      0,
      0,
      docCanvas?.value?.width,
      docCanvas?.value?.height
    );
    if (
      CONSTANT.YEAR_TIME_LENGTH / TOTAL_TIME / times <
      CONSTANT.MAX_VIEW_PROPORTION
    ) {
      drawRect(offset, times, EACH_TIME_ARRAY.yearArray as TimeNode[], 'year');
    } else if (
      CONSTANT.MONTH_TIME_LENGTH / TOTAL_TIME / times <
      CONSTANT.MAX_VIEW_PROPORTION
    ) {
      drawRect(
        offset,
        times,
        EACH_TIME_ARRAY.monthArray as TimeNode[],
        'month'
      );
    } else if (
      CONSTANT.WEEK_TIME_LENGTH / TOTAL_TIME / times <
      CONSTANT.MAX_VIEW_PROPORTION
    ) {
      drawRect(offset, times, EACH_TIME_ARRAY.weekArray as TimeNode[], 'week');
    } else if (
      CONSTANT.DAY_TIME_LENGTH / TOTAL_TIME / times <
      CONSTANT.MAX_VIEW_PROPORTION
    ) {
      drawRect(offset, times, EACH_TIME_ARRAY.dayArray as TimeNode[], 'day');
    } else {
      drawRect(offset, times, EACH_TIME_ARRAY.hourArray as TimeNode[], 'hour');
    }
    drawLine();
    setLeftDragTime();
    setRightDragTime();
    drawPlan();
    drawUpload(times);
  };

  /**
   * 移动滚轴到最左或最右边
   * @param leftOrRight
   */
  function goFarLeftOrRight(leftOrRight: number) {
    if (leftOrRight === 1) {
      smallMarginRight -= smallMarginLeft;
      smallMarginLeft = 0;
      right -= left;
      left = 0;
    } else {
      smallMarginLeft -= smallMarginRight;
      smallMarginRight = 0;
      left += 1 - right;
      right = 1;
    }
    redrawByLeftAndRight();
  }

  /**
   * 计算移动时的差值
   * @param mode 0: 左右键模式，1: 拖动模式
   */
  function diffComputed(mode = 0) {
    const times = right - left;
    let diff = 0;
    if (
      CONSTANT.YEAR_TIME_LENGTH / TOTAL_TIME / times <
      CONSTANT.MAX_VIEW_PROPORTION
    ) {
      diff = CONSTANT.MONTH_TIME_LENGTH;
    } else if (
      CONSTANT.MONTH_TIME_LENGTH / TOTAL_TIME / times <
      CONSTANT.MAX_VIEW_PROPORTION
    ) {
      diff = CONSTANT.WEEK_TIME_LENGTH / 5;
    } else if (
      CONSTANT.WEEK_TIME_LENGTH / TOTAL_TIME / times <
      CONSTANT.MAX_VIEW_PROPORTION
    ) {
      diff = CONSTANT.DAY_TIME_LENGTH;
    } else if (
      CONSTANT.DAY_TIME_LENGTH / TOTAL_TIME / times <
      CONSTANT.MAX_VIEW_PROPORTION
    ) {
      diff = CONSTANT.HOUR_TIME_LENGTH * 5;
    } else {
      diff = CONSTANT.HOUR_TIME_LENGTH / 2;
    }
    diff /= TOTAL_TIME;
    if (mode === 1) {
      diff /= 5;
    }
    return diff;
  }

  /**
   * 向左或向右移动一小段滚轴
   * @param leftOrRight
   */
  const goLeftOrRight = useThrottleFn((leftOrRight: number, mode = 0) => {
    const sliderWidth = docSlider.value.offsetWidth;
    const diff = diffComputed(mode);
    if (leftOrRight === 1 && left >= diff) {
      left -= diff;
      right -= diff;
    } else if (leftOrRight === 1 && left < diff) {
      right -= left;
      left = 0;
    } else if (leftOrRight === 2 && right + diff <= 1) {
      left += diff;
      right += diff;
    } else if (leftOrRight === 2 && right + diff > 1) {
      left += 1 - right;
      right = 1;
    }
    if ((right - left) * sliderWidth < 20) {
      if (left > 0.5) {
        smallMarginLeft = 20 - (right - left) * sliderWidth;
        smallMarginRight = 0;
      } else {
        smallMarginLeft = 0;
        smallMarginRight = (right - left) * sliderWidth - 20;
      }
    }
    redrawByLeftAndRight();
  }, 10);

  /**
   * 调整canvas和scroll的宽度
   */
  function resizeScroll() {
    const { clientWidth } = document.body;
    // 505和365两个数字由clientWidth推断而来，如果左导航栏宽度变更，则需要重新计算
    // const sliderWidth = docSlider?.value?.offsetWidth;
    // docCanvas.value.width = (docTimelineCanvas?.value?.clientWidth as number) - CONSTANT.LINE_MARGIN * 2;
    const sliderWidth = clientWidth - 505;
    docCanvas.value.width = clientWidth - 365 - CONSTANT.LINE_MARGIN * 2;
    docCanvas.value.height = (2 * DATA.value.length + 1) * CONSTANT.LINE_HEIGHT;
    docGrip.value.style.left = '0px';
    docLeftDrag.value.style.left = '0px';
    docRightDrag.value.style.left = `${sliderWidth}px`;
    docGrip.value.style.width = `${sliderWidth}px`;
    left = 0;
    right = 1;
    smallMarginLeft = 0;
    smallMarginRight = 0;
    draw(left, right - left);
  }

  /**
   * 左侧滑块移动事件
   * @param {*} event 事件详情
   */
  function leftDragMousemove(event: MouseEvent) {
    const diff = event.x - draglayerX;
    if (diff === 0) return;
    if (TOTAL_TIME <= CONSTANT.HOUR_TIME_LENGTH * CONSTANT.MAX_VIEW_PROPORTION)
      return;
    const sliderLeft = docSlider?.value?.offsetLeft;
    const sliderWidth = docSlider?.value?.offsetWidth;
    const rightDragLeft = parseInt(
      docRightDrag?.value?.style.left?.replace('px', '') || '0',
      10
    );
    const leftDragLeft = parseInt(
      docLeftDrag?.value?.style.left?.replace('px', '') || '0',
      10
    );

    // 计算实际位置
    let eventX = leftDragLeft + sliderLeft + diff;

    // 当进入微调，且正在拉长时间线，且微调值不为0时
    if (diff < 0 && smallMarginLeft !== 0) {
      smallMarginLeft += diff;
    } else {
      // eventX限制条件
      eventX = Math.max(eventX, sliderLeft); // > 0
      eventX = Math.min(eventX, sliderLeft + rightDragLeft - 20); // > 0
      eventX = Math.min(eventX, rightDragLeft + sliderLeft); // < rightDragLeft
      // 显示hour为单位的时间线时，单个时间块最多占整个view的CONSTANT.MAX_VIEW_PROPORTION
      eventX = Math.min(
        eventX,
        (right -
          CONSTANT.HOUR_TIME_LENGTH /
            TOTAL_TIME /
            CONSTANT.MAX_VIEW_PROPORTION) *
          sliderWidth +
          sliderLeft
      );

      // 判断是否进入微调，且正在缩短时间线
      if (docGrip?.value?.offsetWidth === 20) {
        smallMarginLeft += diff;
        smallMarginLeft = Math.min(
          smallMarginLeft,
          (right -
            CONSTANT.HOUR_TIME_LENGTH /
              TOTAL_TIME /
              CONSTANT.MAX_VIEW_PROPORTION) *
            sliderWidth +
            sliderLeft -
            eventX
        );
      }

      // 改变视图
      docGrip.value.style.left = `${eventX - sliderLeft}px`;
      docLeftDrag.value.style.left = `${eventX - sliderLeft}px`;
      docGrip.value.style.width = `${rightDragLeft - eventX + sliderLeft}px`;
    }

    smallMarginLeft = Math.max(smallMarginLeft, 0);
    left = (eventX + smallMarginLeft - sliderLeft) / sliderWidth;
    draw(left, right - left);
    draglayerX = event.x;
  }

  /**
   * 右侧滑块移动事件
   * @param {*} event 事件详情
   */
  function rightDragMousemove(event: MouseEvent) {
    const diff = event.x - draglayerX;
    if (diff === 0) return;
    if (TOTAL_TIME <= CONSTANT.HOUR_TIME_LENGTH * CONSTANT.MAX_VIEW_PROPORTION)
      return;
    const sliderLeft = docSlider?.value?.offsetLeft;
    const sliderWidth = docSlider?.value?.offsetWidth;
    const leftDragLeft = parseInt(
      docLeftDrag?.value?.style.left?.replace('px', '') || '0',
      10
    );
    const rightDragLeft = parseInt(
      docRightDrag?.value?.style.left?.replace('px', '') || '0',
      10
    );

    // 计算实际位置
    let eventX = rightDragLeft + sliderLeft + diff;

    // 当进入微调，且正在拉长时间线，且微调值不为0时
    if (diff > 0 && smallMarginRight !== 0) {
      smallMarginRight += diff;
    } else {
      // eventX限制条件
      eventX = Math.min(eventX, sliderWidth + sliderLeft);
      eventX = Math.max(eventX, leftDragLeft + sliderLeft + 20);
      eventX = Math.max(
        eventX,
        (left +
          CONSTANT.HOUR_TIME_LENGTH /
            TOTAL_TIME /
            CONSTANT.MAX_VIEW_PROPORTION) *
          sliderWidth +
          sliderLeft
      );

      // 判断是否进入微调，且正在缩短时间线
      if (docGrip?.value?.offsetWidth === 20) {
        smallMarginRight += diff;
        smallMarginRight = Math.max(
          smallMarginRight,
          (left +
            CONSTANT.HOUR_TIME_LENGTH /
              TOTAL_TIME /
              CONSTANT.MAX_VIEW_PROPORTION) *
            sliderWidth +
            sliderLeft -
            eventX
        );
      }

      // 改变视图
      docRightDrag.value.style.left = `${eventX - sliderLeft}px`;
      docGrip.value.style.width = `${eventX - sliderLeft - leftDragLeft}px`;
    }
    smallMarginRight = Math.min(smallMarginRight, 0);
    right = (eventX + smallMarginRight - sliderLeft) / sliderWidth;
    draw(left, right - left);
    draglayerX = event.x;
  }

  /**
   * 中间滑块移动事件
   * @param {*} event 事件详情
   */
  function middleDragMousemove(event: MouseEvent) {
    const diff = event.x - draglayerX;
    if (diff === 0) return;

    const sliderLeft = docSlider?.value?.offsetLeft;
    const sliderWidth = docSlider?.value?.offsetWidth;
    const dragWidth = docGrip?.value?.style.width?.replace('px', '') || '0';
    const leftDragLeft = parseInt(
      docLeftDrag?.value?.style.left?.replace('px', '') || '0',
      10
    );

    // 计算实际位置
    let eventX = leftDragLeft + sliderLeft + diff;

    // 限制条件
    eventX = Math.max(eventX, sliderLeft);
    eventX = Math.min(
      eventX,
      sliderWidth - parseInt(dragWidth, 10) + sliderLeft
    );

    const dragLeft = eventX - sliderLeft;
    docGrip.value.style.left = `${dragLeft}px`;
    docLeftDrag.value.style.left = `${dragLeft}px`;
    docRightDrag.value.style.left = `${dragLeft + parseInt(dragWidth, 10)}px`;
    // 利用原始差值计算right
    const difference = right - left;
    left = (dragLeft + smallMarginLeft) / sliderWidth;
    right = left + difference;
    draw(left, right - left);
    draglayerX = event.x;
  }

  /**
   * 获取元素距离左侧的距离
   * @param element
   */
  function getLeftDistance(element: any) {
    let distance = element.offsetLeft;
    while (element.offsetParent) {
      element = element.offsetParent;
      distance += element.offsetLeft;
    }
    return distance;
  }

  /**
   * 画布滚动缩放事件
   * @param event 滚轮事件
   */
  function canvasScroll(event: WheelEvent) {
    let offsetX = event.clientX - getLeftDistance(docCanvas.value) - 2;
    offsetX = Math.max(Math.min(offsetX, docCanvas.value.offsetWidth), 0);
    const scrollValue = event.deltaY;
    const canvasLeft = offsetX;
    const canvasWidth = docCanvas.value.offsetWidth;
    const canvasRight = canvasWidth - canvasLeft;
    const diff = diffComputed();
    if (scrollValue > 0) {
      left += (diff * canvasLeft) / canvasWidth;
      right -= (diff * canvasRight) / canvasWidth;
      // 最小间隔
      const minDiff =
        CONSTANT.HOUR_TIME_LENGTH / CONSTANT.MAX_VIEW_PROPORTION / TOTAL_TIME;
      if (right - left < minDiff) {
        left -= (diff * canvasLeft) / canvasWidth;
        right = left + minDiff;
      }
    } else {
      left = Math.max(left - (diff * canvasLeft) / canvasWidth, 0);
      right = Math.min(right + (diff * canvasRight) / canvasWidth, 1);
    }
    const sliderWidth = docSlider.value.offsetWidth;
    if ((right - left) * sliderWidth < 20) {
      if (left > 0.5) {
        smallMarginLeft = 20 - (right - left) * sliderWidth;
        smallMarginRight = 0;
      } else {
        smallMarginLeft = 0;
        smallMarginRight = (right - left) * sliderWidth - 20;
      }
    }
    redrawByLeftAndRight();
  }

  /**
   * 画布拖动事件
   * @param event
   */
  function canvasDrag(event: MouseEvent) {
    if (event.movementX === 0) return;
    goLeftOrRight(event.movementX > 0 ? 1 : 2, 1);
  }

  /**
   * 画布点击事件，激活拖动事件
   */
  function canvasClick() {
    document.addEventListener('mousemove', canvasDrag);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', canvasDrag);
    });
  }

  /**
   * 鼠标抬起事件，删除移动监听
   */
  function mouseUp() {
    document.removeEventListener('mousemove', leftDragMousemove);
    document.removeEventListener('mousemove', rightDragMousemove);
    document.removeEventListener('mousemove', middleDragMousemove);
  }

  /**
   * 设置组件响应事件
   */
  function setAction() {
    // 添加鼠标抬起事件
    document.addEventListener('mouseup', mouseUp);
    // 添加鼠标点击事件
    docLeftDrag.value.onmousedown = (event: MouseEvent) => {
      draglayerX = event.x;
      document.addEventListener('mousemove', leftDragMousemove);
    };
    docRightDrag.value.onmousedown = (event: MouseEvent) => {
      draglayerX = event.x;
      document.addEventListener('mousemove', rightDragMousemove);
    };
    docGrip.value.onmousedown = (event: MouseEvent) => {
      draglayerX = event.x;
      document.addEventListener('mousemove', middleDragMousemove);
    };
    // 窗口大小变更监听
    window.addEventListener('resize', resizeScroll);
  }

  /**
   * 通过DATA计算常量
   */
  function calculatedConstant() {
    const timeArray = getStartEndTime([
      ...DATA.value,
      {
        uploadHistory: PLAN_DATA.value,
      },
    ]);
    const [startTime, endTime] = timeArray;
    START_TIME = startTime;
    END_TIME = endTime;
    TOTAL_TIME = END_TIME.getTime() - START_TIME.getTime();
    EACH_TIME_ARRAY = getTimeArray(START_TIME, END_TIME, TOTAL_TIME);
    left = 0;
    right = 1;
    smallMarginLeft = 0;
    smallMarginRight = 0;
  }

  /**
   * 当数据刷新时需要执行的操作
   */
  function dataRefresh() {
    calculatedConstant();
    initCanvasAndScroll();
    draw(left, right - left);
    const team: any = props.selfTeams.find((item: any) => {
      return item.id === props.currentTeamId;
    });
    currentTeamColor.value = team.color;
  }

  onMounted(() => {
    DATA.value = props.data;
    PLAN_DATA.value = props.planData;
    docCtx.value = docCanvas.value?.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    nextTick(() => {
      setAction();
      dataRefresh();
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeScroll);
    document.removeEventListener('mouseup', mouseUp);
    document.removeEventListener('mouseup', () => {
      document.removeEventListener('mousemove', canvasDrag);
    });
  });

  watch(
    () => props.data,
    (val) => {
      DATA.value = val;
      dataRefresh();
    }
  );
  watch(
    () => props.planData,
    (val) => {
      PLAN_DATA.value = val;
      dataRefresh();
    }
  );
</script>

<style lang="less" scoped>
  @import '../less/style.less';
  :deep(.svg-fill-color) {
    stop-color: v-bind(currentTeamColor);
    fill: v-bind(currentTeamColor);
  }
  .bubble {
    position: absolute;
    z-index: 9;
    color: #ffffff;
    transform: translateX(-100%);
    margin-left: 276px;
    white-space: nowrap;
    transition: opacity 0.3s ease-in-out;
    .triangle {
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-top-color: black;
      margin-left: calc(100% - 32px);
    }
    .cont {
      min-width: 50px;
      display: block;
      height: 32px;
      line-height: 32px;
      padding: 0 8px;
      background-color: black;
      border-radius: 2px;
      text-align: center;
    }
  }
  .triangle {
    fill: #86909c;
    stroke: #86909c;
    stroke-width: 4;
  }
  .svg-line {
    stroke: #86909c;
    stroke-width: 2;
  }
  .upline-timeline-legend {
    width: 192px;
    padding-right: 8px;
    padding-top: v-bind(lineWeight);
    height: v-bind(teamBoxHeight);
    overflow-y: v-bind(teamBoxScroll);
    margin-right: 8px;
  }

  .upline-selectable {
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
    background-color: rgb(84, 110, 122);
    margin: v-bind(lineHeight) 5px v-bind(lineHeight) 0;
    padding: 0 10px;
    color: #ffffff;
    height: v-bind(lineHeight);
    line-height: v-bind(lineHeight);
    font-size: 14px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    .dropdown-button {
      opacity: 0;
      cursor: pointer;
    }
    .team-name {
      display: flex;
      align-items: center;
      width: calc(100% - 14px);
      .current-team {
        display: flex;
        align-items: center;
        height: 100%;
        margin-right: 4px;
        margin-top: -9px;
      }
      .self-team {
        width: 0;
        height: 0;
        border-top: 4px solid transparent;
        border-left: 4px solid transparent;
        border-right: 4px solid white;
        border-bottom: 4px solid white;
        border-bottom-right-radius: 4px;
        position: absolute;
        right: 1px;
        bottom: 1px;
      }
      .attention-team {
        display: flex;
        align-items: center;
        margin: 0 6px 0 4px;
      }
      .team-name-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .upline-selectable:hover {
    .dropdown-button {
      opacity: 1;
    }
  }
</style>
