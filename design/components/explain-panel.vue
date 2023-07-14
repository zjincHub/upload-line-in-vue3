<template>
  <div class="explain">
    <div class="title">
      {{ isSelf ? '本团队泳道图图例' : '其他团队泳道图图例 ' }}
      <div class="annotation">(数字徽标单击/缩放可展开)</div>
    </div>
    <div v-for="(item, index) in data" :key="index" class="explain-item">
      <div
        :class="'graph ' + item.class + (item.children ? ' have-children' : '')"
      >
        <div></div>
      </div>
      <div v-if="item.children" class="mark">{{ item.children }}</div>
      <div class="text">
        <div v-for="(line, i) in item.text" :key="i" class="line">
          {{ line }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps({
    color: {
      type: String,
      default() {
        return '#F76560';
      },
    },
    isSelf: {
      type: Boolean,
      default() {
        return true;
      },
    },
  });
  const color = props.isSelf ? props.color : '#999999';
  const data = props.isSelf
    ? [
        {
          class: 'type1',
          text: ['本团队时间线上的虚线圆', '表示已保存但尚未提交的新共享包'],
        },

        {
          class: 'type3',
          text: [
            '本团队时间线上的浅色圆',
            '表示已提交但尚未审核完成的新共享包',
          ],
        },
        {
          class: 'type4',
          text: ['本团队时间线上的实心圆', '表示已共享的共享包'],
        },
        {
          class: 'type5',
          text: ['本团队时间线上的虚线方块', '表示已保存但尚未提交的新交付包'],
        },
        {
          class: 'type7',
          text: [
            '本团队时间线上的浅色方块',
            '表示已提交但尚未审核完成的新交付包',
          ],
        },
        {
          class: 'type8',
          text: ['本团队时间线上的实心方块', '表示已发布的交付包'],
        },
        {
          class: 'type4',
          text: ['带数字符的实心圆', '代表一组已共享的共享包'],
          children: 16,
        },
        {
          class: 'type11',
          text: ['带数字符的实心鼓形', '代表一组已完成的共享包和发布包'],
          children: 16,
        },
      ]
    : [
        {
          class: 'type2',
          text: [
            '其他团队时间线上的空心圆',
            '表示一个共享包已经共享',
            '但本团队并未下载使用该资料包',
          ],
        },
        {
          class: 'type4',
          text: ['其他团队时间线上的实心圆', '表示一个本团队已下载使用资料包'],
        },
        {
          class: 'type8',
          text: ['其他团队时间线上的实心方块', '表示已发布的交付包'],
        },
        {
          class: 'type2',
          text: [
            '带数字符的空心圆',
            '代表一组已共享的共享包',
            '但本团队并未下载使用',
          ],
          children: 16,
        },
        {
          class: 'type4',
          text: [
            '带数字符的实心圆',
            '代表一组已共享的共享包',
            '且本团队已全部下载使用',
          ],
          children: 16,
        },
        {
          class: 'type9',
          text: [
            '带数字符的双色圆',
            '代表一组已共享的共享包',
            '本团队已部分下载使用',
          ],
          children: 16,
        },
        {
          class: 'type8',
          text: ['带数字符的实心方块', '代表一组已发布的交付包'],
          children: 16,
        },
        {
          class: 'type11',
          text: ['带数字符的实心鼓形', '代表一组已完成的共享包和发布包'],
          children: 16,
        },
        {
          class: 'type10',
          text: ['带数字符的双色鼓形', '代表一组包含未使用共享包与发布包组合'],
          children: 16,
        },
      ];
</script>

<style lang="less" scoped>
  .title {
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 8px;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: flex-end;
    .annotation {
      font-size: 12px;
      margin: 0 0 2px 8px;
    }
  }
  .explain-item {
    margin-top: 8px;
    display: flex;
    align-items: flex-start;
    position: relative;
    .mark {
      position: absolute;
      top: 6px;
      left: 16px;
      line-height: 16px;
      background-color: v-bind(color);
      color: #ffffff;
      font-size: 12px;
      padding: 0px 5px;
      border-radius: 10px;
      border: 2px solid #ffffff;
    }
    .graph {
      width: 16px;
      height: 16px;
      margin: 14px 24px 0 16px;
    }
    .have-children {
      margin-left: 8px;
      margin-right: 32px;
    }
    .type1 {
      border: 2px dotted v-bind(color);
      border-radius: 50%;
    }
    .type2 {
      border: 2px solid v-bind(color);
      border-radius: 50%;
    }
    .type3 {
      border: 2px solid v-bind(color);
      border-radius: 50%;
      div {
        width: 100%;
        height: 100%;
        background-color: v-bind(color);
        opacity: 0.3;
        border-radius: 50%;
      }
    }
    .type4 {
      border: 2px solid v-bind(color);
      border-radius: 50%;
      background-color: v-bind(color);
    }
    .type5 {
      border: 2px dotted v-bind(color);
      border-radius: 4px;
    }
    .type7 {
      border: 2px solid v-bind(color);
      border-radius: 4px;
      div {
        width: 100%;
        height: 100%;
        background-color: v-bind(color);
        opacity: 0.3;
      }
    }
    .type8 {
      border: 2px dotted v-bind(color);
      border-radius: 4px;
      background-color: v-bind(color);
    }
    .type9 {
      border: 2px solid v-bind(color);
      border-radius: 50%;
      background: linear-gradient(
        to right,
        v-bind(color) 0%,
        v-bind(color) 50%,
        white 50%,
        white 100%
      );
    }
    .type10 {
      width: 18px;
      margin: 14px 32px 0 8px;
      border: 2px solid v-bind(color);
      border-radius: 40%;
      background: linear-gradient(
        to right,
        v-bind(color) 0%,
        v-bind(color) 50%,
        white 50%,
        white 100%
      );
    }
    .type11 {
      width: 18px;
      margin: 14px 32px 0 8px;
      border: 2px solid v-bind(color);
      border-radius: 40%;
      background: v-bind(color);
    }
    .text {
      font-size: 14px;
      .line {
        color: var(--color-text-3);
      }
    }
    .text .line:first-child {
      color: var(--color-text);
    }
  }
</style>
