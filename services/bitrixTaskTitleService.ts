import axios from 'axios';

export async function fetchBitrixTaskTitleById(idtask: number): Promise<string | null> {
  if (!idtask) return null;
  try {
    const response = await axios.get(`http://10.0.0.6:3001/api/bbitrixtask/${idtask}`);
    if (response.data && response.data.title) {
      return response.data.title;
    }
    return null;
  } catch (error) {
    return null;
  }
}
