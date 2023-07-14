import { TableColumnData } from '@arco-design/web-vue/es/table/interface';

export type Column = TableColumnData & { checked?: true };

export const fileColumns: Column[] = [
  {
    title: '序号',
    dataIndex: 'index',
    slotName: 'index',
    width: 62,
    align: 'center',
  },
  {
    title: '名称',
    dataIndex: 'name',
    slotName: 'name',
    align: 'left',
    width: 460,
  },
  {
    title: '说明',
    dataIndex: 'description',
    slotName: 'description',
    align: 'left',
  },
  {
    title: '版本',
    dataIndex: 'version',
    slotName: 'version',
    width: 100,
    align: 'center',
  },
  {
    title: '大小',
    dataIndex: 'size',
    slotName: 'size',
    width: 160,
    align: 'center',
  },
];
