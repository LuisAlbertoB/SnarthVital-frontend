export interface User {
  id?: number;
  name: string;
  lastname: string;
  email: string;
  password: string;
  profile_picture: string | null; // URL or base64 string for the profile picture
  role: 'admin' | 'doctor' | 'patient';
}
