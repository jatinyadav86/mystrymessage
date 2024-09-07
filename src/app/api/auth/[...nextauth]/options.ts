import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";



export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any, req): Promise<any> {
                await dbConnect()

                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.email },
                            { username: credentials.username }
                        ]
                    })
                    if (!user) {
                        throw new Error("No user found with this email")
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account first before login")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error("Incorrect Password")
                    }

                } catch (error: any) {
                    throw new Error(error)
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.GOOGLE_SECRET ?? "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? ""
        })
    ],
    callbacks: {
        async signIn({ account, user, profile }) {

            await dbConnect()

            try {
                const existingUser = await UserModel.findOne({ email: user.email })
                const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

                if (existingUser) {
                    if (existingUser.isVerified == true) {
                        return true
                    } else if (existingUser.isVerified == false) {
                        existingUser.verifyCode = verifyCode
                        existingUser.verifyCodeExpiry = new Date(Date.now() + 3600000)
                        await existingUser.save()
                    }
                    return true
                } else {
                    let username
                    let isVerified
                    if(account?.provider === "github"){
                        username = profile?.login ?? ""
                        isVerified = true
                    }else{
                        username = user.email?.split("@")[0]
                        isVerified = false
                    }

                    if ((profile as { email_verified?: boolean })?.email_verified) {
                        const newUser = new UserModel({
                            username,
                            email: user.email,
                            isVerified,
                            messages: []
                        })
                        await newUser.save()
                    } else {
                        const newUser = new UserModel({
                            username,
                            email: user.email,
                            isVerified,
                            verifyCode: verifyCode,
                            verifyCodeExpiry: new Date(Date.now() + 3600000),
                            messages: []
                        })
                        await newUser.save()
                    }
                    return true
                }
            } catch (error: any) {
                console.log(error)
                throw new Error(error)
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
        },
        async session({ session, user }) {
            if (user) {
                session.user._id = user._id?.toString()
                session.user.isVerified = user.isVerified
                session.user.isAcceptingMessages = user.isAcceptingMessages
                session.user.username = user.username
            } else {
                await dbConnect()
                const existingUser = await UserModel.findOne({ email: session.user?.email })

                if (existingUser) {
                    session.user._id = existingUser._id?.toString()
                    session.user.isVerified = existingUser.isVerified
                    session.user.isAcceptingMessages = existingUser.isAcceptingMessages
                    session.user.username = existingUser.username
                }
            }

            return session
        }
    },
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}