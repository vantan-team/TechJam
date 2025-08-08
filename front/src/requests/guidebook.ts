import { customFetch } from '@/utils/fetch';

// ガイドブック関連の型定義
export interface GuideBook {
  id: number;
  title: string;
  image_url?: string;
  geo: string;
  genre: string;
  contents_count: number;
  author?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface GuideBookContent {
  id: number;
  star: number;
  comment: string;
  shop: {
    id: number;
    name: string;
    address: string;
    category: string;
  };
  created_at: string;
}

export interface CreateGuideBookRequest {
  title: string;
  geo: string;
  genre: string;
}

export interface CreateGuideContentRequest {
  shop_id: number;
  star: number;
  comment: string;
  photo?: File;
}

// ガイドブック一覧取得
export const getGuideBooks = async (): Promise<GuideBook[]> => {
  const response = await customFetch('/api/guidebooks');
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブック取得エラー:', data);
    throw new Error(data.message || 'ガイドブック取得に失敗しました');
  }
  
  return data.guidebooks || [];
};

// ガイドブック詳細取得
export const getGuideBook = async (id: number): Promise<GuideBook> => {
  const response = await customFetch(`/api/guidebooks/${id}`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブック詳細取得エラー:', data);
    throw new Error(data.message || 'ガイドブック取得に失敗しました');
  }
  
  return data.guidebook;
};

// ガイドブック作成
export const createGuideBook = async (requestData: CreateGuideBookRequest): Promise<GuideBook> => {
  const response = await customFetch('/api/guidebooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブック作成エラー:', data);
    throw new Error(data.message || 'ガイドブック作成に失敗しました');
  }
  
  return data.guidebook;
};

// ガイドブック更新
export const updateGuideBook = async (id: number, requestData: Partial<CreateGuideBookRequest>): Promise<GuideBook> => {
  const response = await customFetch(`/api/guidebooks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブック更新エラー:', data);
    throw new Error(data.message || 'ガイドブック更新に失敗しました');
  }
  
  return data.guidebook;
};

// ガイドブック削除
export const deleteGuideBook = async (id: number): Promise<void> => {
  const response = await customFetch(`/api/guidebooks/${id}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブック削除エラー:', data);
    throw new Error(data.message || 'ガイドブック削除に失敗しました');
  }
};

// ガイドブックコンテンツ一覧取得
export const getGuideBookContents = async (guidebookId: number): Promise<{contents: GuideBookContent[], guidebook_title: string}> => {
  const response = await customFetch(`/api/guidebooks/${guidebookId}/contents`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブックコンテンツ取得エラー:', data);
    throw new Error(data.message || 'コンテンツ取得に失敗しました');
  }
  
  return {
    contents: data.contents,
    guidebook_title: data.guidebook_title
  };
};

// ガイドブックコンテンツ追加
export const addGuideBookContent = async (guidebookId: number, requestData: CreateGuideContentRequest): Promise<GuideBookContent> => {
  const response = await customFetch(`/api/guidebooks/${guidebookId}/contents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブックコンテンツ追加エラー:', data);
    throw new Error(data.message || 'コンテンツ追加に失敗しました');
  }
  
  return data.content;
};

// ガイドブックコンテンツ更新
export const updateGuideBookContent = async (
  guidebookId: number, 
  contentId: number, 
  requestData: Partial<CreateGuideContentRequest>
): Promise<GuideBookContent> => {
  const response = await customFetch(`/api/guidebooks/${guidebookId}/contents/${contentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブックコンテンツ更新エラー:', data);
    throw new Error(data.message || 'コンテンツ更新に失敗しました');
  }
  
  return data.content;
};

// ガイドブックコンテンツ削除
export const deleteGuideBookContent = async (guidebookId: number, contentId: number): Promise<void> => {
  const response = await customFetch(`/api/guidebooks/${guidebookId}/contents/${contentId}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('ガイドブックコンテンツ削除エラー:', data);
    throw new Error(data.message || 'コンテンツ削除に失敗しました');
  }
};
