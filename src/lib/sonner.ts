import { toast } from "sonner";

export const ___showSuccessToastNotification = ({ message, messages }: { message?: string; messages?: string[] }) => {
  if (messages) {
    messages.map((message) => {
      toast.success(message);
    });
  } else {
    toast.success(message);
  }
};


export const showInfoToastFn = (message: string) => {
  toast.info(message);
};

export const showWarningToastFn = (message: string) => {
  toast.warning(message);
};

export const ___showErrorToastNotification = ({ message, messages }: { message?: string; messages?: string[] }) => {
  if (messages) {
    messages.map((message) => {
      toast.error(message);
    });
  } else {
    toast.error(message);
  }
};
