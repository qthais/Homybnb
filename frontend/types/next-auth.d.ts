// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string | null;
    name: string | null;
    image?: string | null;
    favoriteIds?: number[];
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      favoriteIds?: number[];
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn:string;
    };
    error?:string;
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      favoriteIds?: number[];
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn:string;
    };
    error?:string;
  }
}
