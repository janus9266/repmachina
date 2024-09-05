import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      httpOptions: {
        timeout: 40000,
      },
      authorization: {
        params: {
          scope: 'openid profile email',
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async signIn({ account, profile }) {
      console.log("+++++++++++++++++++++++++++++++ SignIn")
      if(account?.provider === "google"){        
        console.log("+++++++++++++++++++++++++++++++")
        return true
      } else {
        return "/signup"
      }
    },
    async jwt({ token, account, user }) {      
      if (account) {
        console.log("+++++++++++++++++++++ token: ", token)
        console.log("+++++++++++++++++++++ account", account)
        console.log("++++++++++++++++++++ Backend URL", `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${account?.id_token}`,
            },
          }
        );
        const resParsed = await res.json();
        token = Object.assign({}, token, {
          id_token: account.id_token,
        });
        token = Object.assign({}, token, {
          myToken: resParsed.authToken,
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (session) {
        session = Object.assign({}, session, {
          id_token: token.id_token,
        });
        session = Object.assign({}, session, {
          authToken: token.myToken,
        });
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV !== "production" ? true : false,
});

export { handler as GET, handler as POST };
