
type User = {
    name: string | null;
    email: string | null;
    image: string | null;
    hashedPassword: string | null;
    id: string;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export type SafeUser = {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  };
  
export default User