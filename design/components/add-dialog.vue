<template>
  <a-modal
    :unmount-on-close="true"
    :visible="visible"
    :title="title"
    @cancel="cancel"
  >
    <template #footer>
      <a-button @click="cancel">取消</a-button>
      <a-button v-if="teamPermission > 1" @click="submitData(true)"
        >保存</a-button
      >
      <a-button
        v-if="teamPermission > 1"
        type="primary"
        @click="submitData(false)"
        >提交</a-button
      >
    </template>
    <a-spin style="width: 100%" :loading="loading">
      <div class="content">
        <a-form
          ref="formRef"
          :model="formData"
          label-align="right"
          :rules="rules"
        >
          <a-row>
            <a-col :span="24">
              <a-form-item
                field="processId"
                label="批准工作流"
                label-col-flex="90px"
                :validate-trigger="['change', 'input']"
              >
                <a-select v-model="formData.processId" placeholder="请选择">
                  <a-option
                    v-for="template in processList"
                    :key="`${template.id}-${template.name}`"
                    :value="template.id"
                    :label="template.name"
                  ></a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="24">
              <a-form-item
                field="name"
                :label="`${title}名称`"
                label-col-flex="90px"
                :validate-trigger="['change', 'input']"
              >
                <a-input v-model="formData.name" placeholder="请输入" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-divider />
          <a-row>
            <a-col :span="24">
              <a-form-item hide-label>
                <div class="file-list" style="width: 100%">
                  <div class="title">
                    <div class="text">
                      <img
                        src="@/assets/images/check/Frame@2x.png"
                        alt=""
                        style="width: 17px; height: 17px"
                      />
                      <span class="text-font">{{ `需${title}文件` }}</span>
                    </div>
                    <div class="file-count">
                      <span>总计：{{ fileCounts || 0 }} 个文件</span>
                      <a-button
                        v-if="teamPermission > 1"
                        type="text"
                        @click="treeFolderVisible = true"
                      >
                        添加文件
                      </a-button>
                    </div>
                  </div>
                  <div class="file-list-wrap">
                    <FileCollapse
                      v-show="fileList.length"
                      v-model:files="fileList"
                    ></FileCollapse>
                  </div>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="title === '交付'">
            <a-col :span="24">
              <a-form-item
                field="milestoneId"
                label="里程碑"
                label-col-flex="80px"
                :validate-trigger="['change', 'input']"
              >
                <a-select v-model="formData.milestoneId" placeholder="请选择">
                  <a-option
                    v-for="template in milestoneList"
                    :key="`${template.id}-${template.name}`"
                    :value="template.id"
                    :label="template.name"
                  ></a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <TreeFolder
          v-model:visible="treeFolderVisible"
          :ok-function="fileChange"
          :config="treeFolderConfig"
          :default-data="fileIdList"
        ></TreeFolder>
        <TreeFolder
          v-if="initialData.id"
          v-model:visible="calculateModal"
          :ok-function="calculateFileChange"
          :config="{ ...treeFolderConfig, calculate: true }"
          :default-data="initFileList"
        ></TreeFolder>
      </div>
    </a-spin>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import FileCollapse from '@/views/check/components/file-collapse/index.vue';
  import TreeFolder from '@/components/tree-folder/index.vue';
  import { useRoute } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import {
    queryMilestoneList,
    MilestoneSearchParams,
  } from '@/views/project-setting/plan/api';
  import {
    getDirectoryFileCounts,
    getDirectoryFileIds,
  } from '@/views/check/api';
  import {
    getProcess,
    addDeliver,
    saveDeliver,
    addShare,
    saveShare,
    submitShare,
    submitDelivery,
  } from './api';

  interface ProcessObj {
    id?: string | number;
    name?: string;
  }

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    files: {
      type: Array,
      default() {
        return [];
      },
    },
    treeFolderConfig: {
      type: Object,
      default: () => {
        // empty
      },
    },
    initialData: {
      type: Object,
      default: () => {
        // empty
      },
    },
    teamPermission: {
      type: Number,
      default: 0,
    },
  });
  const emits = defineEmits(['update:visible', 'submit', 'refreshTeamData']);
  const route = useRoute();
  const processList = ref<ProcessObj[]>([]);
  const getProcessList = () => {
    const params = {
      pageNo: 1,
      pageSize: 100000,
      projectId: route.params.projectId,
    };
    getProcess(params)
      .then((res: any) => {
        if (res.code === 8000000) {
          processList.value = res.data.list || [];
        }
      })
      .catch((e) => {
        if (e) {
          processList.value = [];
        }
      });
  };

  const milestoneList = ref<ProcessObj[]>([]);
  const getMilestoneList = () => {
    const params: MilestoneSearchParams = {
      pageNo: 1,
      pageSize: 100000,
      projectId: (route.params.projectId || '') as string,
    };
    queryMilestoneList(params)
      .then((res: any) => {
        if (res.status) {
          milestoneList.value = res.data.list || [];
        }
      })
      .catch((e) => {
        if (e) {
          milestoneList.value = [];
        }
      });
  };

  const formRef = ref<FormInstance>();
  const formData = ref({
    name: '',
    processId: '',
    milestoneId: '',
  });
  const rules = ref({
    name: [
      {
        required: true,
        message: '请输入名称',
      },
    ],
    processId: [
      {
        required: true,
        message: '请选择流程',
      },
    ],
  });
  const fileList = ref([]);

  const fileCounts = computed(() => {
    let counts = 0;
    fileList?.value?.forEach((file) => {
      counts += getDirectoryFileCounts(file);
    });
    return counts;
  });

  const getIdByFileList = (fileList2: any[]) => {
    const ids: any[] = [];
    fileList2.forEach((item) => {
      if ('folderId' in item) {
        ids.push(item.id);
      }
      if (item.children) {
        ids.push(...getIdByFileList(item.children));
      }
    });
    return ids;
  };

  const fileIdList = computed(() => {
    const result = getIdByFileList(fileList.value);
    return result;
  });

  const fileIds = computed(() => {
    const ids: any[] = getDirectoryFileIds(fileList.value);
    return ids;
  });
  const treeFolderVisible = ref(false);
  const fileChange = async (data: () => Promise<any>) => {
    const files = await data();
    fileList.value = files;
  };

  const cancel = () => {
    fileList.value = [];
    emits('update:visible', false);
  };
  const submitData = async (isSave = false) => {
    const res = await formRef.value?.validate();
    if (!res) {
      let params: any = {};
      if (props.initialData.id) {
        params = {
          ...props.initialData,
          name: formData.value.name,
          fileIds: fileIds.value,
          fileCount: fileCounts.value,
        };
      } else {
        params = {
          name: formData.value.name,
          cdeProcessId: formData.value.processId,
          fileIds: fileIds.value,
          projectId: route.params.projectId,
          fileCount: fileCounts.value,
          teamId: props.treeFolderConfig.teamId,
        };
      }
      if (!params.fileCount) {
        Message.error('请至少选择一个文件');
      } else if (props.title === '共享') {
        let api = null;
        if (isSave) {
          api = saveShare;
        } else if (props.initialData.id) {
          params = {
            id: props.initialData.id,
          };
          api = submitShare;
        } else {
          api = addShare;
        }
        api(params).then((result: any) => {
          if (result.status) {
            Message.success(isSave ? '保存成功！' : '创建成功！');
            emits('submit', true);
            emits('refreshTeamData');
            cancel();
          }
        });
      } else {
        let api = null;
        let deliverP = {};
        if (isSave) {
          api = saveDeliver;
          deliverP = { ...params, milestoneId: formData.value.milestoneId };
        } else if (props.initialData.id) {
          params = {
            id: props.initialData.id,
          };
          deliverP = params;
          api = submitDelivery;
        } else {
          api = addDeliver;
          deliverP = { ...params, milestoneId: formData.value.milestoneId };
        }
        api(deliverP).then((result: any) => {
          if (result.code === 8000000) {
            Message.success(isSave ? '保存成功！' : '创建成功！');
            emits('submit', true);
            emits('refreshTeamData');
            cancel();
          }
        });
      }
    }
  };

  // 保存共享包回显
  const initFileList = computed(() => {
    let result = [];
    if (props.initialData.fileList) {
      result = props.initialData.fileList.map((item: any) => item.fileId);
    }
    return result;
  });
  const calculateModal = ref(false);
  const loading = ref(false);
  const calculateFileChange = async (data: () => Promise<any>) => {
    const files = await data();
    fileList.value = files;
    calculateModal.value = false;
    loading.value = false;
  };
  const init = () => {
    if (props.initialData.id) {
      loading.value = true;
      calculateModal.value = true;
    }
    formData.value = {
      name: props.initialData.name || '',
      processId: props.initialData.cdeProcessId || '',
      milestoneId: props.initialData.milestoneId || '',
    };
    if (Array.isArray(props.files) && props.files?.length) {
      fileList.value = JSON.parse(JSON.stringify(props.files));
    }
    getProcessList();
    getMilestoneList();
  };
  watch(
    () => props.visible,
    (val) => {
      if (val) {
        init();
      }
    }
  );
</script>

<style scoped lang="less">
  .title {
    position: relative;
    .text {
      display: flex;
      align-content: center;
      align-items: center;
    }
    .text-font {
      display: inline-block;
      font-size: 16px;
      font-weight: 600;
      margin-left: 8px;
    }
    .file-count {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  .file-list-wrap {
    margin-top: 16px;
    min-height: 20px;
  }
</style>
