import { toast } from "sonner";

export const showSuccessToastFn = (message: string) => {
  toast.success(message);
};

export const showInfoToastFn = (message: string) => {
  toast.info(message);
};

export const showWarningToastFn = (message: string) => {
  toast.warning(message);
};

export const showErrorToastFn = ({ message, messages }: { message?: string; messages?: string[] }) => {
  if (messages) {
    messages.map((message) => {
      toast.error(message);
    });
  } else {
    toast.error(message);
  }
};
