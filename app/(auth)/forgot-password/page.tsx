'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPassword() {
  return (
    <main className='min-h-screen flex flex-col '>
      <Image
        src={require('./home.svg')}
        alt='...'
        className='w-full z-40 -mt-32'
        width={200}
        height={200}
      />

      <div className='relative z-10 flex-1 flex flex-col px-6'>
        <div className='mb-6'>
          <Link
            href='/login'
            className='inline-flex items-center text-[#303030]'
          >
            <ChevronLeft className='h-5 w-5' />
          </Link>
        </div>

        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-[#303030]'>Forget password</h1>
          <p className='text-sm text-[#303030]/80'>
            Enter your email and we'll send a code to your account
          </p>
        </div>

        <form className='space-y-4 pb-12 '>
          <div>
            <input
              type='email'
              placeholder='EMAIL ID'
              className='w-full px-4 py-3 rounded-3xl border border-[#303030]/20 bg-white text-[#303030] placeholder:text-[#303030]/50 placeholder:text-xs focus:outline-none'
            />
          </div>

          <button
            type='submit'
            className='w-full rounded-3xl bg-[#f7c334] text-[#303030] font-medium py-3  shadow-sm mt-4'
          >
            SEND MAIL
          </button>
        </form>
      </div>
    </main>
  );
}
