import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          // Request full repo access and user info
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user info to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = account.providerAccountId;
      }
      if (profile) {
        token.username = profile.login;
        token.name = profile.name;
        token.email = profile.email;
        token.avatar = profile.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken as string;
      session.user.githubId = token.githubId as string;
      session.user.username = token.username as string;
      session.user.avatar = token.avatar as string;
      return session;
    },
  },
  pages: {
    signIn: "/workspace", // Redirect to workspace after sign in
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
