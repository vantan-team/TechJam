export interface Restaurant {
  id: string;
  name: string;
  address: string;
  category: string;
  source: 'hotpepper' | 'history' | 'manual';
  photo_url?: string;
  budget?: string;
  hotpepper_id?: string;
  lat?: number | null;
  lng?: number | null;
}
