
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
export default User