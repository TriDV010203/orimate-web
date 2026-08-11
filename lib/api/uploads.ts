// lib/api/uploads.ts — Upload ảnh từ thiết bị lên server (server forward lên Cloudinary, trả về url)

import { request } from "./client";
export type UploadFolder =
  | "tutorials"
  | "achievements"
  | "learning-paths"
  | "community-posts"
  | "daily-challenge"
  | "weekly-challenge"
  | "mode-tests";

export interface UploadImageResponse {
  url: string;
}

export interface UploadModel3DResponse {
  url: string;
}

export const uploadsApi = {
  /** POST /api/uploads/image — Upload 1 ảnh từ thiết bị, trả về URL ảnh đã lưu trên Cloudinary */
  uploadImage(token: string, file: File, folder: UploadFolder): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return request<UploadImageResponse>("/api/uploads/image", {
      method: "POST",
      body: formData,
      token,
    });
  },

  /** POST /api/uploads/model-3d — Upload a GLB model and return its Cloudinary URL. */
  uploadModel3D(token: string, file: File): Promise<UploadModel3DResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return request<UploadModel3DResponse>("/api/uploads/model-3d", {
      method: "POST",
      body: formData,
      token,
    });
  },
};
