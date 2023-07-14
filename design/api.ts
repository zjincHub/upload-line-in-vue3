import axios from 'axios';

export interface TimeNode {
  startTime?: Date;
  endTime?: Date;
  interval?: number;
}

export interface TimeListTypes {
  yearArray?: TimeNode[];
  monthArray?: TimeNode[];
  weekArray?: TimeNode[];
  dayArray?: TimeNode[];
  hourArray?: TimeNode[];
}

export interface UploadPackage {
  bizId?: string;
  createBy?: string;
  createDate?: string;
  deleteFlag?: number;
  entity?: string;
  id?: string;
  isDownload?: boolean;
  processInstanceId?: string;
  processState?: string;
  projectId?: string;
  teamId?: string;
  updateBy?: string;
  updateDate?: string;
}

// 查询里程碑列表
export function queryMilestoneList(projectId: string) {
  return axios.get('/cde-collaboration/milestone/list', {
    params: {
      projectId,
      pageNo: 1,
      pageSize: 9999,
    },
  });
}

export function getProjectProgress(
  projectId: string,
  currentTeamId: string,
  otherTeamId: string
) {
  return axios.get('/cde-collaboration/project/dashboard/progress/accurate', {
    params: {
      projectId,
      currentTeamId,
      otherTeamId,
    },
  });
}

export function getAllTeam(projectId?: string, teamId?: string) {
  return axios.get('/cde-collaboration/team/list', {
    params: {
      projectId,
      teamId,
      pageNo: 1,
      pageSize: 9999,
    },
  });
}

export function getSharedFiles(id: string) {
  return axios.get('/cde-collaboration/collaborate/file/page', {
    params: {
      id,
      pageNo: 1,
      pageSize: 9999,
    },
  });
}

export function getDeliveryFiles(id: string) {
  return axios.get('/cde-collaboration/delivery/file/page', {
    params: {
      id,
      pageNo: 1,
      pageSize: 9999,
    },
  });
}

export function consumeSharedFiles(
  collaborationId: string,
  projectId: string,
  teamId: string
) {
  return axios.post('/cde-collaboration/collaborate/consume', {
    collaborationId,
    projectId,
    teamId,
  });
}

export function getShareDetail(params: any) {
  return axios.get('/cde-collaboration/collaborate/detail', params);
}

export function getDeliveryDetail(params: any) {
  return axios.get('/cde-collaboration/delivery/detail', params);
}
