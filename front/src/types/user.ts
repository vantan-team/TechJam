export type AuthStatus = {
  isLoggedIn: boolean;
  user: User | null;
};

export type User = {
    id: string;
    name: string;
    email?: string;
    profilePhotoUrl?: string;
}

export type Activity = {
  id: string;
  type: 'guidebook' | 'favorite' | 'follow';
  title: string;
  description: string;
  date: Date;
  icon: 'guidebook' | 'star' | 'users';
}

export interface VisitedHistory {
  name: string;
  visited_at: string;
  memo: string;
  hotpepper_id: number;
}

export interface UserProfile extends User {
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  guidebooksCount?: number;
  isFollowing?: boolean;
  isFriend?: boolean;
  isPrivate?: boolean;
}

export interface GuideBook {
  id: number;
  title: string;
  memo: string;
  hotpepper_id: number;
  geo: string;
  genre: string | null;
  cover_image?: string;
}
