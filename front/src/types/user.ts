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