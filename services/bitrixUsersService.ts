// Serviço para buscar usuários do Bitrix via proxy backend
import axios from 'axios';
import { API_BASE_URL } from '../constants';
const API_URL = `${API_BASE_URL}/api/bitrix-users`;

export async function fetchBitrixUsers(params = {}) {
  try {
    const response = await axios.post(API_URL, params);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários do Bitrix:', error);
    throw error;
  }
}
