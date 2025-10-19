"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHandleError } from "@/hooks/use-handle-error";
import { updateDisplayName } from "./actions";

type FormClientType = { nickname: string };

const FormClient = ({ nickname }: FormClientType) => {
  const { handleErrorClient } = useHandleError();
  const [value, setValue] = useState<string>(nickname);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!value) {
      return;
    }
    setLoading(true);
    await handleErrorClient({
      cb: async () => updateDisplayName(value),
      withSuccessNotify: true,
      onSuccess: () => setLoading(false)
    });
  };

  return (
    <form className='flex items-center space-x-2' onSubmit={handleSubmit}>
      <Input
        className='text-center'
        name='displayName'
        onChange={(e) => setValue(e.target.value)}
        placeholder='Tên hiển thị'
        value={value}
      />
      <Button disabled={loading} type='submit'>
        Cập nhật
      </Button>
    </form>
  );
};

export { FormClient };
