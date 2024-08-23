export interface User {
    user_id: number;
    username: string;
    email: string;
    hashed_password: string;
    created_at: Date;
    updated_at: Date;
  }