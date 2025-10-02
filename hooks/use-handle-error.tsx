import type { ResponseType, SuccessResponseType } from "@/types/response";
import { useToast } from "./use-toast";

type HandleErrorType = {
  cb: () => Promise<ResponseType>;
  onSuccess?: ({ data }: { data: SuccessResponseType }) => void;
  withSuccessNotify?: boolean;
};

const useHandleError = () => {
  const { toast } = useToast();

  const handleErrorClient = async ({
    cb,
    onSuccess = () => {
      /* no-op */
    },
    withSuccessNotify = true
  }: HandleErrorType) => {
    const loadingToast = toast({
      title: "Đang suy luận ...",
      description: "Hệ thống đang nỗ lực tính toán ..."
    });

    try {
      const { error, data } = await cb();

      if (error) {
        toast({
          title: "Lỗi",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (withSuccessNotify) {
        toast({
          title: "Thành công",
          description: "Thao tác thành công"
        });
      }

      onSuccess({ data: data ?? {} });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Lỗi không xác định",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    } finally {
      loadingToast.dismiss();
    }
  };

  return { handleErrorClient, toast };
};

export { useHandleError };
