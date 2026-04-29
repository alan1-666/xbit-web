import { toastService } from "./ToastContext";

const toast = {
  info: (message: string) => {
    toastService.addToast(message);
  },
};

export default toast;
