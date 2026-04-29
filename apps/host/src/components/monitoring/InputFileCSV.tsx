import React from "react";
import { useTranslation } from "react-i18next";

const MAX_CSV_BYTES = 100 * 1024; // 100 KB

type CsvInputProps = {
  file: File | null;
  setFile: (file: File | null) => void;
  onValidFile?: (file: File) => Promise<void> | void;
};

type Status = "idle" | "dragging" | "uploading" | "success" | "error";

export function CsvInput({ file, setFile, onValidFile }: CsvInputProps) {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState<Status>("idle");
  const [msg, setMsg] = React.useState<string>("");

  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = (e?: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    e?.stopPropagation();
    e?.preventDefault();
    setStatus("idle");
    setMsg("");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const validateAndHandle = React.useCallback(
    async (file?: File) => {
      if (!file) return;

      const isCsv =
        file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

      if (!isCsv) {
        setStatus("error");
        setMsg("Please select a CSV file (.csv).");
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      if (file.size > MAX_CSV_BYTES) {
        setStatus("error");
        setMsg(
          `File too large: ${(file.size / 1024).toFixed(1)} KB. Max is 100 KB.`
        );
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      // ✅ Save file to parent state
      setFile(file);

      // Looks good -> start "uploading"
      setStatus("uploading");
      setMsg(t("followingWallet.uploading") ?? "Uploading...");

      try {
        const maybePromise = onValidFile?.(file);
        if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
          await (maybePromise as Promise<void>);
        }
        // Done -> success
        setStatus("success");
        setMsg(t("followingWallet.uploaded") ?? "Uploaded successfully.");
      } catch (err: any) {
        setStatus("error");
        setMsg(err?.message || t("followingWallet.uploadFailed") || "Upload failed. Try again.");
      }
    },
    [onValidFile, setFile, t]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    validateAndHandle(e.target.files?.[0]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.items?.length) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const it = e.dataTransfer.items[i];
        if (it.kind === "file") {
          validateAndHandle(it.getAsFile() || undefined).catch(console.error);
          break;
        }
      }
    } else {
      validateAndHandle(e.dataTransfer.files?.[0]).catch(console.error);
    }
  };

  const openPicker = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    inputRef.current?.click();
  };

  const isDragging = status === "dragging";
  const isUploading = status === "uploading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="flex flex-col">
      <input
        ref={inputRef}
        id="inputFileCsv"
        type="file"
        className="hidden"
        accept=".csv,text/csv"
        onChange={onInputChange}
      />

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (status === "idle") setStatus("dragging");
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (status === "dragging") setStatus("idle");
        }}
        className={[
          "mt-3 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition min-h-[145px]",
          "cursor-pointer",
          isSuccess
            ? "border-emerald-400 bg-emerald-400/10"
            : isUploading
              ? "border-white/40 bg-white/5 animate-pulse"
              : isDragging
                ? "border-white/80 bg-white/5"
                : isError
                  ? "border-rose-400 bg-rose-400/10"
                  : "border-white/20 hover:border-white/40 hover:bg-white/5",
        ].join(" ")}
      >
        {/* Content states */}
        {isSuccess && file ? (
          <div className="flex flex-col items-center gap-2 text-center">
            {/* Check icon */}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <div className="text-base font-medium">
              {t("followingWallet.uploadSuccess") ?? "Upload successful"}
            </div>
            <div className="text-sm opacity-80">
              {file.name} • {(file.size / 1024).toFixed(1)} KB
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={openPicker}
                className="rounded-full px-4 py-2 text-sm bg-white text-black shadow"
              >
                {t("followingWallet.replaceFile") ?? "Replace file"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full px-4 py-2 text-sm border border-white/30"
              >
                {t("followingWallet.clear") ?? "Clear"}
              </button>
            </div>
            <div className="mt-2 text-xs opacity-60">{msg}</div>
          </div>
        ) : isUploading && file ? (
          <div className="flex flex-col items-center text-center">
            <div className="text-base font-medium">
              {t("followingWallet.uploading") ?? "Uploading..."}
            </div>
            <div className="mt-1 text-sm opacity-80">
              {file.name} • {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center text-center">
            <div className="text-base font-medium">
              {t("followingWallet.uploadFailed") ?? "Upload failed"}
            </div>
            <div className="mt-1 text-sm opacity-80">{msg}</div>
            <button
              type="button"
              onClick={openPicker}
              className="mt-3 rounded-full px-4 py-2 text-sm bg-white text-black shadow"
            >
              {t("followingWallet.tryAgain") ?? "Try again"}
            </button>
          </div>
        ) : (
          <div className="text-sm opacity-80 text-center">
            <div className="font-medium">
              {t("followingWallet.upload")}
            </div>
            <div className="mt-1">{t('followingWallet.dragDropPrompt')}</div>
            <div className="mt-2 text-xs opacity-60">{t('followingWallet.maxFileInfo')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
