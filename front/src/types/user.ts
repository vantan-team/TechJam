export type AuthStatus = {
  isLoggedIn: boolean;
  user: User | null;
};

export type User = {
    id: string;
    name: string;
    email: string;
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

export interface UserProfile extends User {
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  guidebooksCount?: number;
  isFollowing?: boolean;
  isFriend?: boolean;
}