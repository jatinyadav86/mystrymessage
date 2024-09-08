'use client'
import { useToast } from '@/components/ui/use-toast'
import { signInSchema } from '@/schemas/signInSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from "zod"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

function Page() {
  const [isSubmiting, setIsSubmiting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // zod implimentation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmiting(true)
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password
    })
    if (result?.error) {
      toast({
        title: 'Login failed',
        description: result.error || 'Incorrect username or password',
        variant: "destructive"
      })
    }

    if (result?.url) {
      router.replace('/dashboard')
    }
    setIsSubmiting(false)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md flex justify-center items-center flex-col">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to Mystry Message
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>
        <div className="w-72 flex flex-col items-center justify-center gap-2">
          <div onClick={() => signIn('google')} className="google w-full h-12 border border-[#878787] rounded-full flex justify-around items-center cursor-pointer hover:border-black">
            <Image src="https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg" alt="Google Icon" width={32} height={32} />
            <p className='text-base font-semibold mr-7'>Sign in with Google</p>
          </div>
          <div onClick={() => signIn('github')} className="facebook w-full h-12 border border-[#878787] rounded-full flex justify-around items-center cursor-pointer hover:border-black">
            <Image src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" alt="Google Icon" width={32} height={32} />
            <p className='text-base font-semibold mr-7'>Sign in with GitHub</p>
          </div>
        </div>
        <p>or Sign in with gmail or username</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input {...field} name="email" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className='w-full'>
              {isSubmiting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page