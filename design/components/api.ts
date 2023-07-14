import { getProcessList } from '@/views/project-setting/process/api';
import axios from 'axios';

export const getProcess = getProcessList;

export const addShare = (params: any) => {
  return axios.post('/cde-collaboration/collaborate/save-submit', params);
};

export const saveShare = (params: any) => {
  return axios.post('/cde-collaboration/collaborate/save', params);
};

export const submitShare = (params: any) => {
  return axios.post('/cde-collaboration/collaborate/submit', params);
};

export const addDeliver = (params: any) => {
  return axios.post('/cde-collaboration/delivery/save-submit', params);
};

export const saveDeliver = (params: any) => {
  return axios.post('/cde-collaboration/delivery/save', params);
};

export const submitDelivery = (params: any) => {
  return axios.post('/cde-collaboration/delivery/submit', params);
};
