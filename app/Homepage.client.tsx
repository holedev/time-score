"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { _APP_NAME_FULL, _CLIENT_KEY_USER_ROLE } from "@/constants";
import { UserRole } from "@/types/global";

const HomepageClient = () => {
  const [role, setRole] = useState<UserRole>("anonymous");
  const [shouldRender, setShouldRender] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserRole = () => {
      const roleClient = (localStorage.getItem(_CLIENT_KEY_USER_ROLE) as UserRole) || "anonymous";
      setRole(roleClient);
      setShouldRender(true);
    };
    fetchUserRole();
  }, []);

  return (
    <div className='flex items-center justify-center'>
      <section className='relative px-6 py-20 text-center'>
        <div className='mx-auto max-w-4xl'>
          <h1 className='mb-6 font-bold text-4xl text-gray-900 tracking-tight sm:text-6xl dark:text-white'>
            <span className='block text-blue-600 dark:text-blue-400'>{_APP_NAME_FULL}</span>
          </h1>

          <p className='mx-auto mb-10 max-w-2xl text-gray-600 text-lg dark:text-gray-300'>
            Nền tảng hỗ trợ tổ chức, quản lý và chấm điểm thuyết trình một cách minh bạch và linh hoạt cho các sự kiện
            thuộc Trường Đại học Mở TP. Hồ Chí Minh.
          </p>

          {shouldRender && role === "anonymous" && (
            <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link
                className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-medium text-base text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
                href='/auth'
              >
                Đăng nhập
              </Link>
            </div>
          )}

          {shouldRender && role === "admin" && (
            <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link
                className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-medium text-base text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
                href='/dashboard'
              >
                Đến trang quản trị
              </Link>
            </div>
          )}

          {shouldRender && role === "reviewer" && (
            <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link
                className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-medium text-base text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
                href='/dashboard/reviews'
              >
                Đến trang quản trị
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export { HomepageClient };
