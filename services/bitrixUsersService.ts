// Serviço para buscar usuários do Bitrix via proxy backend
import axios from 'axios';

const API_URL = 'http://10.0.0.6:3001/api/bitrix-users';

export async function fetchBitrixUsers(params = {}) {
  try {
    const response = await axios.post(API_URL, params);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários do Bitrix:', error);
    throw error;
  }
}
