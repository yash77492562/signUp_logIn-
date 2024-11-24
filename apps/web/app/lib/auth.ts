import CredentialsProvider from "next-auth/providers/credentials";
import { User as NextAuthUser, Session as NextAuthSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { prisma } from "@repo/prisma_database/client";
import { userAuthenticate } from "../userAuthenticate/userAuthenticate";
import * as argon2 from "argon2";
import { encrypt } from "@repo/encrypt/client";
import { generateSecureTokenWithSalt } from "../token/token";
import type { CallbacksOptions } from "next-auth";

// Separate provider for login
const loginProvider = CredentialsProvider({
  id: "login-credentials",
  name: "Login",
  credentials: {
    email: { label: "Email", type: "email", placeholder: "example@gmail.com" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials): Promise<NextAuthUser | null> {
    try {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password required");
      }
      console.log(credentials.email , credentials.password)
      const email_token = generateSecureTokenWithSalt(credentials.email)
      // Find user by email
      const user = await prisma.token.findFirst({
        where: { 
          email_token
        },
        select:{
          user:{
            select:{
              password:true,
              id:true
            }
          }
        }
      });

      if (!user || !user.user) {
        throw new Error("No user found with this email");
      }

      // Verify password
      const isValidPassword = await argon2.verify(user.user.password, credentials.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      return {
        id: user.user.id,
        email: credentials.email  // Use unencrypted email for session
      };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }
});

// Separate provider for signup
const signupProvider = CredentialsProvider({
  id: "signup-credentials",
  name: "Signup",
  credentials: {
    username: { label: "Username", type: "text", placeholder: "John Smith" },
    phone: { label: "Phone", type: "tel", placeholder: "1234567899" },
    password: { label: "Password", type: "password" },
    email: { label: "Email", type: "email", placeholder: "example@gmail.com" }
  },
  async authorize(credentials): Promise<NextAuthUser | null> {
    try {
      if (!credentials) {
        throw new Error("Credentials are required");
      }

      const { username, email, password, phone } = credentials;
      console.log(credentials)

      // Check if user exists
      const userExist = await userAuthenticate({ email, phone });
      if (userExist) {
        throw new Error("Email or phone number already exists");
      }

      // Hash password
      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4
      });

      // Encrypt sensitive data
      const encryptEmail = encrypt(email);
      const encryptUsername = encrypt(username);
      const encryptPhone = encrypt(phone);

      // Create user and token in a transaction
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            username: encryptUsername,
            email: encryptEmail,
            phone: encryptPhone,
            password: hashedPassword
          }
        });

        await tx.token.create({
          data: {
            userId: newUser.id,
            email_token: generateSecureTokenWithSalt(email),
            phone_token: generateSecureTokenWithSalt(phone)
          }
        });

        return newUser;
      });

      return {
        id: user.id,
        email: email  // Use unencrypted email for session
      };
    } catch (error) {
      console.error("Signup error:", error);
      return null;
    }
  }
});

// Callbacks for NextAuth
const callbacks: CallbacksOptions = {

  async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
    if (user) {
      token.sub = user.id;
      token.email = user.email;
    }
    return token;
  },


  // Handle user session
  async session({ session, token }) {
    if (token && session.user) {
      session.user.id = token.sub!;
      session.user.email = token.email!;
    }
    return session;
  },

  // Handle sign-in events
  async signIn({ user, account, profile, email, credentials }) {
    // Additional logic (e.g., email verification) can be added here
    return true;
  },

  // Redirect after sign-in
  async redirect({ url, baseUrl }) {
    if (url.startsWith(baseUrl)) return url;
    else if (url.startsWith("/")) return new URL(url, baseUrl).toString();
    return baseUrl;
  }
};

// Export NextAuth configuration
export const authOptions = {
  providers: [loginProvider, signupProvider],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  callbacks
};
