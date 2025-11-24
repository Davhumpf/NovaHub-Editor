import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
      profile(profile: GithubProfile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          githubId: profile.id.toString(),
          avatar: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Persist the OAuth access_token and user info to the token
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = account.providerAccountId;
      }
      if (profile) {
        const githubProfile = profile as GithubProfile;
        token.username = githubProfile.login;
        token.name = githubProfile.name || githubProfile.login;
        token.email = githubProfile.email || undefined;
        token.avatar = githubProfile.avatar_url;
      }
      if (user) {
        token.username = user.username;
        token.githubId = user.githubId;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.githubId) {
        session.user.githubId = token.githubId as string;
      }
      if (token.username) {
        session.user.username = token.username as string;
      }
      if (token.avatar) {
        session.user.avatar = token.avatar as string;
      }
      if (token.name) {
        session.user.name = token.name as string;
      }
      if (token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/workspace", // Redirect to workspace after sign in
    error: "/workspace",  // Redirect to workspace on error
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
