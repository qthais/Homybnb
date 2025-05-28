import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axiosClient from "@/utils/axiosClient";
import { JWT } from "next-auth/jwt";
async function refreshToken(token: JWT): Promise<JWT> {
  try {
    const res = await axiosClient.post(
      "/api/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Refresh ${token.tokens.refreshToken}`,
        },
      }
    );
    const {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    } = res.data.data.tokens;
    console.log("refresh successful");
    return {
      ...token,
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: expiresIn,
      },
      // string → number
    };
  } catch (err:any) {
    console.error(
      "❌ Failed to refresh token:",
      err?.response?.data || err.message
    );
    return {
      ...token,
      error: "Login expired!",
    };
  }
}
export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required!");
        }
        let user;
        try {
          const response = await axiosClient.post("api/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });
          if (response.data?.data?.user) {
            user = response.data.data.user;
            const tokens = response.data.data.tokens;
            return {
              ...user,
              tokens,
            };
          } else {
            throw new Error("User not found in response");
          }
        } catch (err:any) {
          throw err.response.data;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect() {
      const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL; // Use environment variable for client-side URL
      return `${clientUrl}/`; // Redirect to the client-side URL (e.g., localhost:8080)
    },
    async signIn({ user, account }) {
      console.log({user,account})
      if (account?.provider !== "credentials") {
        try {
          const res = await axiosClient.post("api/auth/login/oauth", {
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
            accessToken: account?.access_token,
            refreshToken: account?.refresh_token,
            expiresAt: account?.expires_at,
            tokenType: account?.token_type,
            scope: account?.scope,
          });

          const enrichedUser = res.data?.data?.user;
          const tokens = res.data?.data?.tokens;

          if (!enrichedUser || !tokens) {
            console.error("OAuth login: user or tokens missing");
            return false;
          }
          const { id, name, email, image,favoriteIds } = enrichedUser;
          Object.assign(user, { id, name, email, image, favoriteIds, tokens });
        } catch (error: any) {
          console.error("OAuth login failed:", error || error.message);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user,trigger,session }) {
      if (user) {
        return {
          ...token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            favoriteIds: user.favoriteIds || [],
          },
          tokens: user.tokens, 
        } as JWT;
      }
      if (trigger === "update" && session?.favoriteIds) {
        token.user.favoriteIds = session.favoriteIds as number[];
        return token;
      }
      if (Date.now() < parseInt(token.tokens.expiresIn)) {
        return token as JWT;
      }
      return await refreshToken(token);
    },
    async session({ token, session }) {
      session.user=token.user
      session.tokens = token.tokens;
      session.error = token.error;
      return session;
    },
  },
};

export default NextAuth(authOptions);
