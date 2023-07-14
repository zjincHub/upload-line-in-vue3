<template>
  <a-spin :loading="pageLoading">
    <div class="container">
      <div onselectstart="return false" class="timeline">
        <a-row :gutter="16" style="margin-bottom: 16px">
          <a-col :flex="1">
            <table-title title="泳道图"> </table-title>
          </a-col>
          <a-col :flex="'380px'" style="text-align: right">
            <a-space :size="8">
              <div class="button-explain">
                <div
                  class="explain-self"
                  :style="'color: ' + (teamData[0]?.color || '#F76560')"
                >
                  <a-popover position="br">
                    <icon-exclamation-circle-fill class="explain-icon" />
                    <template #content>
                      <explain-panel
                        :color="teamData[0]?.color || '#F76560'"
                        :is-self="true"
                      ></explain-panel>
                    </template>
                  </a-popover>
                  当前团队图例
                </div>
                <div class="explain-other">
                  <a-popover position="br">
                    <icon-exclamation-circle-fill class="explain-icon" />
                    <template #content>
                      <explain-panel :is-self="false"></explain-panel>
                    </template>
                  </a-popover>
                  团队颜色对应每个团队图例
                </div>
              </div>
            </a-space>
          </a-col>
        </a-row>
        <upload-timeline
          v-if="filterData.length > 0"
          :data="filterData"
          :all-data="teamData"
          :plan-data="planData"
          :team-attention-list="teamAttentionList"
          :self-teams="projectStore.teamList"
          :current-team-id="currentTeamId"
          @set-team-attention="setTeamAttention"
          @check-current-team="checkCurrentTeam"
          @shared-tobe-reviewed="sharedTobeReviewed"
          @other-team-shared="otherTeamShared"
          @shared-in-wip="sharedInWip"
          @save-delivery="saveDelivery"
          @delivery-tobe-reviewed="deliveryTobeReviewed"
          @delivery-in-wip="deliveryInWip"
          @save-shared="saveShared"
          @change-filter-data="changeFilterData"
        ></upload-timeline>
        <div class="button-box">
          <div
            v-if="showButtonSwitch === 0"
            class="loadmore-button"
            @click="loadmore"
          >
            <img src="@/assets/images/design/load-more.png" />
          </div>
          <div v-if="showButtonSwitch === 1" class="middle-button">
            <div class="button-list">
              <div class="button-base" @click.stop="loadmore3">
                <icon-double-down size="20" />
              </div>
              <div class="button-base" @click="loadmore2">
                <icon-down size="20" />
              </div>
              <div class="button-base" @click="close">
                <icon-close size="20" />
              </div>
            </div>
          </div>
          <div v-if="showButtonSwitch === 2" class="middle-button">
            <div class="button-list">
              <div class="button-base" @click.stop="loadmore">
                <icon-double-up size="20" />
              </div>
              <div class="button-base" @click.stop="loadmore3">
                <icon-down size="20" />
              </div>
              <div class="button-base" @click="close">
                <icon-close size="20" />
              </div>
            </div>
          </div>
          <div v-if="showButtonSwitch === 3" class="middle-button">
            <div class="button-list">
              <div class="button-base" @click.stop="loadmore">
                <icon-double-up size="20" />
              </div>
              <div class="button-base" @click.stop="loadmore2">
                <icon-up size="20" />
              </div>
              <div class="button-base" @click="close">
                <icon-close size="20" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <file-table
        ref="fileTableRef"
        :table-data="tableData"
        :breadcrumb-data="breadcrumbData"
        :current-team-id="currentTeamId"
        :loading="fileLoading"
        @folder-skip="folderSkip"
        @refresh-team-data="refreshTeamData"
      ></file-table>
    </div>
    <a-modal
      v-model:visible="visible"
      @before-ok="handleBeforeOk"
      @cancel="handleCancel"
    >
      <template #title> 提示 </template>
      <div> {{ modalText }} </div>
    </a-modal>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { cloneDeep } from 'lodash';
  import { Message } from '@arco-design/web-vue';
  import usePrjPermissionStore from '@/store/modules/project-permission';
  import useUserStore from '@/store/modules/user';
  import TableTitle from '@/components/table-title/index.vue';
  import { getChildFolderList, getFileList } from '@/api/tree-folder';
  import UploadTimeline from './components/upload-timeline.vue';
  import FileTable from './components/table-file.vue';
  import ExplainPanel from './components/explain-panel.vue';
  import {
    getAllTeam,
    getProjectProgress,
    queryMilestoneList,
    getSharedFiles,
    getDeliveryFiles,
    consumeSharedFiles,
    getShareDetail,
    getDeliveryDetail,
  } from './api';
  import CONSTANT from './event/constant';

  const projectStore = usePrjPermissionStore();
  const userStore = useUserStore();
  const showButtonSwitch = ref(0);

  const fileTableRef = ref();

  // 交付计划数据
  const planData = ref([]);
  // 过滤之后的泳道图数据
  const filterData = ref<any[]>([]);
  // 团队数据及泳道图数据
  const teamData = ref<any[]>([]);
  const filterStart = ref(0);
  let maxLineNum = 4;

  const route = useRoute();
  const projectId = (route?.params.projectId || '') as string;

  const teamStorageKey = `first-${projectId}-${userStore.id}`;
  const attentionListKey = `attention-${projectId}-${userStore.id}`;

  const fileLoading = ref(false);
  const pageLoading = ref(false);

  /**
   * 进入页面时获取当前选中的团队
   */
  const getCurrentTeamId = () => {
    let result = '';
    const localStorageId = localStorage.getItem(teamStorageKey);
    const isMyTeam = projectStore.teamList.findIndex(
      (item) => item.id === localStorageId
    );
    if (projectStore.teamList.length === 0) {
      localStorage.removeItem(teamStorageKey);
    } else if (localStorageId && isMyTeam !== -1) {
      result = localStorageId;
    } else {
      result = projectStore.teamList[0].id;
      localStorage.setItem(teamStorageKey, result);
    }
    return result;
  };
  const currentTeamId = ref(getCurrentTeamId());

  const teamAttentionList = ref(
    JSON.parse(localStorage.getItem(attentionListKey) || '[]')
  );

  /**
   * 团队排序
   * @param data 团队列表
   */
  const teamDataSort = (data: any[]) => {
    const dataClone = cloneDeep(data);
    teamAttentionList.value.forEach((item: any) => {
      const index = dataClone.findIndex((itm: any) => itm.id === item);
      const k = dataClone.splice(index, 1);
      dataClone.splice(0, 0, k[0]);
    });
    dataClone.sort((a: any) => {
      let result = 0;
      if (a.id === currentTeamId.value) result = -1;
      return result;
    });
    return dataClone;
  };

  let teamFolderData: any[] = [];
  const tableData = ref<any[]>([]);
  const breadcrumbData = ref<any[]>([]);

  const getFolderByTeamId = (theTeamId: string) => {
    const team = teamFolderData.filter((item) => item.teamId === theTeamId);
    return team[0];
  };

  /**
   * 获取文件夹和文件
   * @param folderId 文件夹id
   */
  const loadFolderAndFile = async (folderId = '0') => {
    fileLoading.value = true;
    const promiseList = [
      await getChildFolderList(projectId, currentTeamId.value, 'WIP', folderId),
      await getFileList(folderId),
    ];
    const res = await Promise.all(promiseList);
    const folderList: any[] = res[0]?.data.list || [];
    const fileList: any[] = res[1]?.data.list || [];
    tableData.value = [...folderList, ...fileList];
    fileLoading.value = false;
  };

  /**
   * 选择团队的wip文件夹
   * @param teamId 团队id
   */
  const setCurrentFolder = (teamId: string) => {
    const theFolder = getFolderByTeamId(teamId);
    if (!theFolder) return;
    loadFolderAndFile(theFolder.id);
    breadcrumbData.value = [
      {
        id: theFolder.id,
        name: theFolder.name,
      },
    ];
  };

  /**
   * 格式化团队的共享交付包信息（uploadTime、type）
   * @param uploadList 共享交付包信息
   * @param isSelfTeam 是否是自己团队
   */
  const formatUploadData = (uploadList: any[], isSelfTeam: boolean) => {
    uploadList.forEach((item, index) => {
      if (index === 0) {
        item.uploadTime = new Date(item.updateDate);
      } else {
        const beforeUploadTime = uploadList[index - 1].uploadTime;
        const thisUploadTime = new Date(item.updateDate);
        item.uploadTime = new Date(
          Math.max(
            thisUploadTime.getTime(),
            beforeUploadTime.getTime() +
              (document.body.offsetHeight < 700 ? 240000 : 120000)
          )
        );
      }
      if (isSelfTeam) {
        if (item.entity === 'collaborate' && item.processState === '3') {
          item.type = 1;
        } else if (item.entity === 'collaborate' && item.processState === '0') {
          item.type = 3;
        } else if (item.entity === 'collaborate' && item.processState === '1') {
          item.type = 4;
        } else if (item.entity === 'delivery' && item.processState === '3') {
          item.type = 5;
        } else if (item.entity === 'delivery' && item.processState === '0') {
          item.type = 7;
        } else if (item.entity === 'delivery' && item.processState === '1') {
          item.type = 8;
        } else {
          item.type = 12;
        }
      } else if (
        item.entity === 'collaborate' &&
        item.isDownload === false &&
        item.processState === '1'
      ) {
        item.type = 2;
      } else if (
        item.entity === 'collaborate' &&
        item.isDownload === true &&
        item.processState === '1'
      ) {
        item.type = 4;
      } else if (item.entity === 'delivery' && item.processState === '1') {
        item.type = 8;
      } else {
        item.type = 12;
      }
    });
    uploadList = uploadList.filter((item) => item.type !== 12);
    return uploadList;
  };

  /**
   * 获取单个team的共享交付包的promise
   * @param team 团队信息
   */
  const getTeamProgress = (team: any) => {
    return new Promise((resolve) => {
      getProjectProgress(team.projectId, currentTeamId.value, team.id).then(
        (res) => {
          team.uploadHistory = formatUploadData(
            res.data,
            team.id === currentTeamId.value
          );
          resolve(null);
        }
      );
    });
  };

  /**
   * 获取teamData和team共享交付包的所有promise
   * @param result 保存结果的对象
   */
  const getTeamDataPromise = async (result: any) => {
    const res = await getAllTeam(projectId);
    result.teamData = teamDataSort(res.data.list);
    const promiseList: any = [];
    if (currentTeamId.value) {
      result.teamData.forEach((item: any) => {
        promiseList.push(getTeamProgress(item));
      });
    }
    return promiseList;
  };

  /**
   * 重新获取teamData数据
   */
  const refreshTeamData = async () => {
    const allPromiseResult = {
      teamData: [],
    };
    // 制造获取所有team的promise List
    const teamDataPromiseList = await getTeamDataPromise(allPromiseResult);
    // 制造获取planData的promise
    await Promise.all(teamDataPromiseList);
    teamData.value = allPromiseResult.teamData;
    if (showButtonSwitch.value === 1) {
      filterData.value = [teamData.value[0]];
    } else {
      filterData.value = teamData.value.slice(
        filterStart.value,
        filterStart.value + maxLineNum
      );
    }
  };

  /**
   * 关注团队
   * @param teamDataItem 团队信息
   */
  const setTeamAttention = (teamDataItem: any) => {
    if (teamAttentionList.value.includes(teamDataItem.id)) {
      teamAttentionList.value.splice(
        teamAttentionList.value.findIndex(
          (item: any) => item === teamDataItem.id
        ),
        1
      );
    } else {
      teamAttentionList.value.push(teamDataItem.id);
    }
    localStorage.setItem(
      attentionListKey,
      JSON.stringify(teamAttentionList.value)
    );
    refreshTeamData();
  };

  /**
   * 选择当前团队
   * @param team 团队信息
   */
  const checkCurrentTeam = (team: any) => {
    // 如果选的不是自己团队，直接返回
    // 如果团队没有对应的folder，直接返回（脏数据）
    if (
      projectStore.teamList.findIndex((item) => item.id === team.id) === -1 ||
      !getFolderByTeamId(team.id)
    )
      return;
    // 设置当前teamId
    currentTeamId.value = team.id;
    localStorage.setItem(teamStorageKey, team.id);
    // 更新teamData
    refreshTeamData();
    // 更新文件区
    setCurrentFolder(currentTeamId.value);
  };

  /**
   * 获取所有团队文件夹
   */
  const getTeamFolder = async () => {
    const res = await getChildFolderList(projectId, undefined, 'WIP', '0');
    teamFolderData = res.data.list;
  };

  /**
   * 文件夹跳转
   * @param folderMsg 文件夹信息
   * @param index breadcrumbData中的位置
   */
  const folderSkip = (folderMsg: any, index = -1) => {
    if (index === breadcrumbData.value.length - 1) return;
    loadFolderAndFile(folderMsg.id);
    if (index === -1) {
      breadcrumbData.value.push({
        id: folderMsg.id,
        name: folderMsg.name,
      });
    } else {
      breadcrumbData.value = breadcrumbData.value.slice(0, index + 1);
    }
  };

  /**
   * 获取planData的promise
   * @param result 保存结果的对象
   */
  const getPlanDataPromise = (result: any): Promise<null> => {
    return new Promise((resolve) => {
      queryMilestoneList(projectId).then((res) => {
        result.planData = res.data.list;
        result.planData.forEach((item: any) => {
          item.uploadTime = new Date(item.endTime);
        });
        resolve(null);
      });
    });
  };

  /**
   * 待审核共享包点击事件
   * @param history 共享交付包信息
   */
  const sharedTobeReviewed = async (history: any) => {
    const res = await getSharedFiles(history.bizId);
    tableData.value = res.data.list;
    breadcrumbData.value = [];
  };

  const saveShared = async (history: any) => {
    const res = await getShareDetail({
      params: { id: history.bizId },
    });
    const shareData = res.data;
    fileTableRef.value.startShare(shareData);
  };

  const visible = ref(false);
  let moadlHistory: any = null;
  const modalText = ref('');
  const handleBeforeOk = async () => {
    await consumeSharedFiles(
      moadlHistory.bizId,
      moadlHistory.projectId,
      currentTeamId.value
    );
    refreshTeamData();
    return true;
  };
  const handleCancel = () => {
    visible.value = false;
  };
  const otherTeamShared = async (history: any) => {
    const res = await getSharedFiles(history.bizId);
    const fileList = res.data.list;
    let fileNames = '';
    fileList.forEach((item: any, index: number) => {
      if (index < fileList.length - 1) {
        fileNames += `${item.name}、`;
      } else {
        fileNames += `${item.name}`;
      }
    });
    visible.value = true;
    moadlHistory = history;
    modalText.value = `${history.name}共享包中包含${fileNames}，是否确认消费${history.name}的共享包？`;
  };

  const sharedInWip = async (history: any) => {
    fileLoading.value = true;
    const res = await getSharedFiles(history.bizId);
    tableData.value = res.data.list;
    breadcrumbData.value = [];
    fileLoading.value = false;
  };

  const saveDelivery = async (history: any) => {
    const res = await getDeliveryDetail({
      params: { id: history.bizId },
    });
    const deliveryData = res.data;
    fileTableRef.value.startDeliver(deliveryData);
  };

  const deliveryTobeReviewed = async (history: any) => {
    fileLoading.value = true;
    const res = await getDeliveryFiles(history.bizId);
    tableData.value = res.data.list;
    breadcrumbData.value = [];
    fileLoading.value = false;
  };

  const deliveryInWip = async (history: any) => {
    fileLoading.value = true;
    const res = await getDeliveryFiles(history.bizId);
    tableData.value = res.data.list;
    breadcrumbData.value = [];
    fileLoading.value = false;
  };

  const setConstant = (size: string) => {
    if (size === 'normal') {
      CONSTANT.LINE_HEIGHT = 28;
      CONSTANT.CIRCLE_DIAMETER = 25;
      CONSTANT.RECT_WIDTH = 25;
      CONSTANT.DRUM_WIDTH = 32;
      CONSTANT.DRUM_HEIGHT = 25;
    } else if (size === 'small') {
      CONSTANT.LINE_HEIGHT = 24;
      CONSTANT.CIRCLE_DIAMETER = 20;
      CONSTANT.RECT_WIDTH = 20;
      CONSTANT.DRUM_WIDTH = 28;
      CONSTANT.DRUM_HEIGHT = 20;
    }
  };

  /**
   * 加载一条团队信息
   */
  const loadmore = () => {
    if (teamData.value.length === 0) {
      Message.warning('没有可以展示的团队');
      return;
    }
    setConstant('normal');
    showButtonSwitch.value = 1;
    filterData.value = [teamData.value[0]];
    filterData.value.forEach((item) => {
      item.beforeHistoryMap = null;
    });
  };

  /**
   * 加载多条团队信息
   */
  const loadmore2 = () => {
    if (teamData.value.length === 1) {
      Message.warning('没有更多团队');
      return;
    }
    setConstant('normal');
    maxLineNum = 4;
    showButtonSwitch.value = 2;
    filterStart.value = 0;
    filterData.value = teamData.value.slice(0, maxLineNum);
    filterData.value.forEach((item) => {
      item.beforeHistoryMap = null;
    });
  };

  /**
   * 加载多条团队信息
   */
  const loadmore3 = () => {
    if (
      teamData.value.length === 1 ||
      (teamData.value.length <= 4 && showButtonSwitch.value === 2)
    ) {
      Message.warning('没有可以展示的团队');
      return;
    }
    if (teamData.value.length <= 4) {
      loadmore2();
      return;
    }
    setConstant('small');
    maxLineNum = 8;
    showButtonSwitch.value = 3;
    filterStart.value = 0;
    filterData.value = teamData.value.slice(0, maxLineNum);
    filterData.value.forEach((item) => {
      item.beforeHistoryMap = null;
    });
  };

  /**
   * 关闭泳道图
   */
  const close = () => {
    showButtonSwitch.value = 0;
    filterData.value = [];
    filterStart.value = 0;
  };

  /**
   * 滚动加载团队信息
   */
  const changeFilterData = (sliceVal: number) => {
    filterStart.value = sliceVal;
    filterData.value = teamData.value.slice(sliceVal, sliceVal + maxLineNum);
    filterData.value.forEach((item) => {
      item.beforeHistoryMap = null;
    });
  };

  onMounted(async () => {
    if (currentTeamId.value) pageLoading.value = true;
    // 获取所有wip下folder信息，用来做teamId->folderId的映射
    await getTeamFolder();
    // 获取当前文件区文件
    if (currentTeamId.value) setCurrentFolder(currentTeamId.value);
    const allPromiseResult = {
      teamData: [],
      planData: [],
    };
    // 制造获取所有team的promise List
    const teamDataPromiseList = await getTeamDataPromise(allPromiseResult);
    // 制造获取planData的promise
    const planDataPromise = getPlanDataPromise(allPromiseResult);
    await Promise.all([...teamDataPromiseList, planDataPromise]);
    teamData.value = allPromiseResult.teamData;
    planData.value = allPromiseResult.planData;
    if (currentTeamId.value) {
      loadmore();
      pageLoading.value = false;
    }
  });
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    padding: 24px 0;
    display: flex;
    flex-direction: column;
  }
  .timeline {
    border-bottom: 1px solid var(--color-border);
    padding: 0 44px;
    width: 100%;
    border-radius: 8px;
    position: relative;
    transition: height 0.2s ease-out;
  }
  .button-box {
    width: 108px;
    height: 38px;
    position: absolute;
    bottom: -38px;
    left: 50%;
    border: 1px solid var(--color-border);
    border-top: 1px solid var(--color-bg-1);
    border-radius: 0 0 8px 8px;
    .loadmore-button {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      margin-top: -4px;
      cursor: pointer;
      img {
        width: 96px;
        height: 37px;
      }
    }
    .middle-button {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      .button-list {
        width: 96px;
        height: 32px;
        background-color: rgb(235, 240, 255);
        color: #3366ff;
        border-radius: 6px;
        position: relative;
        margin-top: -4px;
        display: flex;
        .button-base {
          height: 32px;
          width: 32px;
          color: #3366ff;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 6px;
        }
        .button-base:hover {
          background-color: #3366ff;
          color: #fff;
        }
      }
    }
  }
  .button-explain {
    display: flex;
    align-items: center;
    .explain-icon {
      margin-right: 8px;
      cursor: pointer;
    }
    .explain-self {
      margin-right: 16px;
    }
    .explain-other {
      color: #999999;
    }
  }
  .file {
    width: 100%;
    padding: 24px 44px 0 44px;
    flex: 1;
  }
  .file-header {
    font-size: 18px;
    font-weight: 500;
    margin: -24px 0 24px 0;
    display: flex;
    img {
      margin-right: 8px;
    }
    .text {
      color: var(--color-text-1);
      font-size: 18px;
      font-weight: 500;
    }
  }
</style>
