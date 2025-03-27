// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      name: string;
      image: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: number;
      email: string;
      name: string;
      image: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  }
}
