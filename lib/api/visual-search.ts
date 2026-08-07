// lib/api/visual-search.ts
import { request } from './client';

export const visualSearchApi = {
  searchByImage: async (file: File) => {
    const formData = new FormData();
    // 💡 LƯU Ý QUAN TRỌNG: Tên field trong FormData phải là "file" 
    // để khớp chính xác với tham số 'IFormFile file' bên C# Controller của bạn!
    formData.append("file", file);

    // Cập nhật lại đúng đường dẫn URL có chứa tiền tố api/v1/visualsearch/search-by-object
    const response = await request('/api/v1/visualsearch/search-by-object', {
      method: 'POST',
      body: formData,
    });
    
    return response;
  }
};