<template>
  <div class="table-file">
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :flex="1">
        <table-title title="文件列表">
          <template #default>
            <div class="file-list-title">
              <span>文件列表</span>
              <a-breadcrumb>
                <template #separator>
                  <icon-right />
                </template>
                <a-breadcrumb-item
                  v-for="(item, i) in breadcrumbData"
                  :key="i"
                  @click="$emit('folderSkip', item, i)"
                  >{{ item.name }}</a-breadcrumb-item
                >
              </a-breadcrumb>
            </div>
          </template>
        </table-title>
      </a-col>
      <a-col :flex="'460px'" style="text-align: right">
        <a-space :size="8">
          <a-form
            :model="searchForm"
            label-align="left"
            style="margin-right: 16px"
          >
            <a-form-item field="name" label="名称" label-col-flex="36px">
              <a-input-search
                v-model="searchName"
                search-button
                placeholder="请输入"
                @search="handleChange"
                @keydown.enter="handleChange"
              />
            </a-form-item>
          </a-form>
          <a-button type="outline" @click="startShare">共享</a-button>
          <a-button type="primary" @click="startDeliver">发起交付</a-button>
        </a-space>
      </a-col>
    </a-row>
    <div style="flex: 1; overflow: hidden">
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="{
          showTotal: true,
          showPageSize: true,
          showJumper: true,
          defaultPageSize: 20,
          pageSizeOptions: [20, 50, 100],
        }"
        :columns="columns"
        :data="tableData.filter((item) => item.name.includes(searchForm.name))"
        :bordered="false"
        :scroll="{ x: '100%', y: '100%' }"
        table-layout-fixed
        column-resizable
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
        <template #name="{ record }">
          <div class="table-name">
            <img
              v-if="record.version"
              src="@/assets/images/file-manager/file.png"
              class="table-file-name-img"
            />
            <img
              v-else
              src="@/assets/images/file-manager/folder2.png"
              class="table-file-name-img"
            />

            <div v-if="record.version" class="text-overflow">{{
              record.name
            }}</div>
            <div
              v-else
              class="folder-name text-overflow"
              @click="$emit('folderSkip', record)"
              >{{ record.name }}</div
            >
          </div>
        </template>
        <template #description="{ record }">
          <div class="text-overflow">{{ record.description }}</div>
        </template>
        <template #version="{ record }">
          <a-tag v-if="record.version" bordered color="cyan"
            >V{{ record.version }}</a-tag
          >
        </template>
        <template #size="{ record }">
          {{ record.size ? getFileSize(record.size) : '' }}
        </template>
      </a-table>
    </div>
    <AddDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :tree-folder-config="treeFolderConfig"
      :initial-data="initialData"
      :team-permission="teamPermission"
      v-bind="$attrs"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, PropType, defineExpose, computed } from 'vue';
  import TableTitle from '@/components/table-title/index.vue';
  import { getFileSize } from '@/utils/file';
  import { Message } from '@arco-design/web-vue';
  import usePrjPermissionStore from '@/store/modules/project-permission';
  import { fileColumns, Column } from './table-column';
  import AddDialog from './add-dialog.vue';

  const props = defineProps({
    tableData: {
      type: Array as PropType<any[]>,
      default() {
        return [];
      },
    },
    breadcrumbData: {
      type: Array as PropType<any[]>,
      default() {
        return [];
      },
    },
    currentTeamId: {
      type: String,
      default() {
        return '';
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });

  defineEmits(['folderSkip']);

  const projectStore = usePrjPermissionStore();

  const columns = ref<Column[]>(fileColumns);

  const searchForm = ref({
    name: '',
  });
  const searchName = ref('');
  const handleChange = () => {
    searchForm.value.name = searchName.value;
  };

  const teamPermission = computed(() => {
    return (
      projectStore.teamList.find((item) => item.id === props.currentTeamId)
        ?.role || 0
    );
  });

  const treeFolderConfig = reactive({
    type: 1,
    module: ['wip'],
    teamIds: [props.currentTeamId],
    teamId: props.currentTeamId,
  });
  const dialogVisible = ref(false);
  const dialogTitle = ref('共享');
  const initialData = ref({});
  const startShare = (initData = {}) => {
    if (!('id' in initData) && teamPermission.value < 3) {
      Message.warning('没有权限');
      return;
    }
    dialogTitle.value = '共享';
    treeFolderConfig.module = ['wip'];
    treeFolderConfig.teamId = props.currentTeamId;
    treeFolderConfig.teamIds = [props.currentTeamId];
    dialogVisible.value = true;
    initialData.value = initData;
  };

  const startDeliver = (initData = {}) => {
    if (!('id' in initData) && teamPermission.value < 3) {
      Message.warning('没有权限');
      return;
    }
    dialogTitle.value = '交付';
    treeFolderConfig.module = ['shared'];
    treeFolderConfig.teamId = props.currentTeamId;
    treeFolderConfig.teamIds = [props.currentTeamId];
    dialogVisible.value = true;
    initialData.value = initData;
  };

  defineExpose({ startShare, startDeliver });
</script>

<style lang="less" scoped>
  .table-file {
    margin-top: 48px;
    padding: 0 44px;
    flex-shrink: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .arco-form-item {
      margin-bottom: 0;
    }
  }

  .optional-title-icon {
    width: 46px;
    text-align: center;
  }
  .dropdown {
    position: absolute;
    :deep(.arco-dropdown-list-wrapper) {
      max-height: none;
    }
  }
  :deep(.arco-tag-size-medium) {
    line-height: 24px;
    border-radius: 4px;
  }
  .file-list-title {
    display: flex;
    align-items: flex-end;
    span {
      margin-right: 16px;
    }
  }
  :deep(.arco-breadcrumb-item) {
    cursor: pointer;
  }
  .table-name {
    display: flex;
    align-items: center;
    .table-file-name-img {
      width: 12px;
      margin-right: 8px;
    }
    .folder-name {
      cursor: pointer;
      color: rgb(var(--primary-6));
    }
  }
  .text-overflow {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
