'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { SocialLogin } from './social-login';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className='min-h-screen flex flex-col  '>
      {/* <BackgroundImage /> */}
      <Image
        src={require('./home.svg')}
        alt='...'
        className='w-full z-40 -mt-32'
        width={200}
        height={200}
      />

      <div className='relative flex-1 flex flex-col px-7'>
        <div className='mb-3'>
          <Link href='/' className='inline-flex items-center text-[#303030]'>
            <ChevronLeft className='' size={28} />
          </Link>
        </div>

        <div className='mb-8'>
          <h1 className='text-2xl pb-2 font-bold text-[#303030]'>Login</h1>
          <p className='text-sm text-[#303030]/80'>
            Fill the details to login to your account
          </p>
        </div>

        <form className='space-y-4 flex-col'>
          <div>
            <input
              type='email'
              placeholder='EMAIL ID'
              className='w-full px-4 py-3 rounded-3xl border border-[#303030]/20 bg-white text-[#303030] placeholder:text-[#303030]/50 placeholder:text-xs focus:outline-none'
            />
          </div>

          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='PASSWORD'
              className='w-full px-4 py-3 rounded-3xl border border-[#303030]/20 bg-white text-[#303030] placeholder:text-[#303030]/50 placeholder:text-xs focus:outline-none'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute  right-3 top-1/2 transform -translate-y-1/2 text-[#303030]/50'
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>

          <button
            type='submit'
            className='w-full bg-[#f7c334] text-[#303030] font-medium py-3 rounded-3xl shadow-sm mt-4'
          >
            Login
          </button>
          <div className='text-right flex justify-center '>
            <Link
              href='/forgot-password'
              className=' text-sm text-[#f7c334]/80'
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        <SocialLogin />
      </div>
    </main>
  );
}
