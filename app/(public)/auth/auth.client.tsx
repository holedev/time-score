"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Provider } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/configs/supabase/client";
import { _CLIENT_KEY_USER_ROLE } from "@/constants";
import { _ROUTE_AUTH_CALLBACK } from "@/constants/route";
import { useHandleError } from "@/hooks/use-handle-error";
import type { ResponseType } from "@/types/response";
import { DecodedTokenType } from "@/utils/handle-error-server";

const _minPasswordLength = 6;

const AuthClient = () => {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();

  const formSchema = z.object({
    "email-input-0": z.string().min(1, "Email là bắt buộc").email("Vui lòng nhập địa chỉ email hợp lệ"),
    "password-input-0": z
      .string()
      .min(1, "Mật khẩu là bắt buộc")
      .min(_minPasswordLength, `Mật khẩu phải có ít nhất ${_minPasswordLength}  ký tự`)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "email-input-0": "",
      "password-input-0": ""
    }
  });

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  async function handleLoginWithPassword(values: z.infer<typeof formSchema>) {
    const { "email-input-0": email, "password-input-0": password } = values;

    const supabase = createClient();
    await handleErrorClient({
      cb: async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        return { data, error } as ResponseType;
      },
      onSuccess: ({ data }) => {
        const accessToken = data?.session?.access_token;
        if (accessToken) {
          const decodedToken = jwtDecode<DecodedTokenType>(accessToken);
          localStorage.setItem(_CLIENT_KEY_USER_ROLE, decodedToken.user_role);
        }
        // TODO: SPA
        window.location.reload();
      },
      withSuccessNotify: false
    });
  }

  const handleLoginWithProvider = async (provider: Provider) => {
    const supabase = createClient();
    const redirectTo = `${location.origin}${_ROUTE_AUTH_CALLBACK}`;

    await handleErrorClient({
      cb: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo }
        });
        return { data, error } as ResponseType;
      },
      withSuccessNotify: false
    });
  };

  return (
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle className='font-bold text-xl uppercase'>Đăng nhập</CardTitle>
        <CardDescription className='text-muted-foreground'>Đăng nhập vào tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Form {...form}>
          <form
            className='@container space-y-8'
            onReset={onReset}
            onSubmit={form.handleSubmit(handleLoginWithPassword)}
          >
            <div className='grid grid-cols-12 gap-4'>
              <FormField
                control={form.control}
                name='email-input-0'
                render={({ field }) => (
                  <FormItem className='col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end'>
                    <FormLabel className='flex shrink-0'>Email</FormLabel>

                    <div className='w-full'>
                      <FormControl>
                        <div className='relative w-full'>
                          <Input
                            className=' '
                            id='email-input-0'
                            key='email-input-0'
                            placeholder=''
                            type='email'
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Vui lòng nhập email của bạn.</FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password-input-0'
                render={({ field }) => (
                  <FormItem className='col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end'>
                    <FormLabel className='flex shrink-0'>Password</FormLabel>

                    <div className='w-full'>
                      <FormControl>
                        <div className='relative w-full'>
                          <Input
                            id='password-input-0'
                            key='password-input-0'
                            placeholder=''
                            type='password'
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Vui lòng nhập mật khẩu của bạn.</FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className='w-full'>
              <Button
                className='w-full'
                id='submit-button-0'
                key='submit-button-0'
                name=''
                type='submit'
                variant='default'
              >
                Đăng nhập
              </Button>
            </div>
          </form>
        </Form>
        <hr className='my-4' />
        <Button className='w-full max-w-sm' onClick={() => handleLoginWithProvider("google")} variant='outline'>
          Đăng nhập với Google (comming soon)
        </Button>
      </CardContent>
    </Card>
  );
};

export { AuthClient };
