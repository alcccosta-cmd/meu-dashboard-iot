import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: AuthOptions = {
  // O adapter conecta o NextAuth ao seu banco de dados via Prisma
  adapter: PrismaAdapter(prisma),
  
  // Chave secreta para criptografar os tokens (JWT)
  secret: process.env.NEXTAUTH_SECRET,
  
  // Estratégia de sessão
  session: {
    strategy: "jwt",
  },
  
  // Define a página de login customizada
  pages: {
    signIn: "/login",
  },

  // Define os provedores de autenticação. Usaremos apenas "Credentials" (email/senha)
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // Esta é a função que valida o login
      async authorize(credentials) {
        console.log("API de Autenticação: Tentativa de login recebida com:", { email: credentials?.email });

        if (!credentials?.email || !credentials.password) {
          console.log("API de Autenticação: Email ou senha faltando no formulário.");
          return null;
        }

        // 1. Procura o usuário no banco de dados pelo email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("API de Autenticação: Usuário encontrado no DB:", user ? { id: user.id, email: user.email } : null);

        if (!user) {
          console.log("API de Autenticação: Usuário não encontrado no banco de dados.");
          return null;
        }

        // 2. Compara a senha enviada com a senha criptografada que está salva no banco
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        console.log("API de Autenticação: A senha fornecida é válida?", isPasswordValid);

        if (!isPasswordValid) {
          console.log("API de Autenticação: Comparação de senha falhou.");
          return null;
        }

        console.log("API de Autenticação: Login bem-sucedido! Retornando dados do usuário.");
        // 3. Se tudo estiver certo, retorna os dados do usuário para a sessão
        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],

  // Callbacks para incluir o ID do usuário na sessão
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };0