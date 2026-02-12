import axios from 'axios';

export async function fetchBitrixGroupNameById(groupId: number): Promise<string | null> {
  if (!groupId) return null;
  try {
    const response = await axios.get(`http://10.0.0.6:3001/api/bbitrixgrupo/${groupId}`);
    if (response.data && response.data.nome) {
      return response.data.nome;
    }
    return null;
  } catch (error) {
    return null;
  }
}
