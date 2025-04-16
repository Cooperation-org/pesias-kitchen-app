'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className='  '>
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
          <h1 className='text-2xl font-bold text-[#303030]'>Sign up</h1>
          <p className='text-sm text-[#303030]/80'>
            Create your account and get started
          </p>
        </div>
        <form className='space-y-4'>
          <div>
            <input
              type='text'
              placeholder='FIRST NAME'
              className='w-full px-4   py-3 rounded-3xl border border-[#303030]/20 bg-white text-[#303030] placeholder:text-[#303030]/50 placeholder:text-xs focus:outline-none'
            />
          </div>

          <div>
            <input
              type='text'
              placeholder='LAST NAME'
              className='w-full px-4 py-3 rounded-3xl border border-[#303030]/20 bg-white text-[#303030] placeholder:text-[#303030]/50 placeholder:text-xs focus:outline-none'
            />
          </div>

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
            CREATE ACCOUNT
          </button>
        </form>

        {/* <SocialLogin /> */}
        <button className='w-full mt-8 mb-12 border-2 border-[#6736FF]  text-[#6736FF] font-medium py-1 rounded-3xl shadow-sm'>
          <Image
            src={require('./good.png')}
            width={1}
            height={1}
            className='w-[38px] h-[38px] inline mr-3'
            alt='..'
          />
          Sign up with GoodWallet
        </button>
      </div>
    </main>
  );
}
