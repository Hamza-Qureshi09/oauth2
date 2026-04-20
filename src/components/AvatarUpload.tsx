import { CircleUserRoundIcon, XIcon } from "lucide-react";
import {
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import React from "react";
import { Spinner } from "./ui/spinner";

export function AvatarUpload({
  onUpload,
  initialFile,
  showCancel = true,
  ...props
}: {
  showCancel?: boolean;
  initialFile?: FileMetadata;
  onUpload: (file: FileWithPreview, signal: AbortSignal) => Promise<void>;
} & React.ComponentProps<"input">) {
  const [busy, setBusy] = React.useState(false);
  const signalRef = React.useRef<AbortController>(null);

  const [
    { files, isDragging },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    initialFiles: initialFile && [initialFile],
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    accept: "image/*",
  });

  const file = files[0];
  const previewUrl = file?.preview || null;

  React.useEffect(() => {
    if (file) {
      setBusy(true);
      signalRef.current = new AbortController();
      onUpload(file, signalRef.current.signal).finally(() => setBusy(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <>
      {/* Drop area */}
      <div className="relative max-w-fit">
        <button
          aria-label={previewUrl ? "Change image" : "Upload image"}
          className="relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-input border-dashed outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-[img]:border-none has-disabled:opacity-50 data-[dragging=true]:bg-accent/50"
          data-dragging={isDragging || undefined}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          type="button"
          disabled={busy}
        >
          {busy ? (
            <Spinner />
          ) : previewUrl ? (
            <img
              alt={files[0]?.file?.name || "Uploaded image"}
              className="size-full object-cover"
              height={64}
              src={previewUrl}
              style={{ objectFit: "cover" }}
              width={64}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="size-4 opacity-60" />
            </div>
          )}
        </button>
        {previewUrl && showCancel && (
          <Button
            aria-label="Remove image"
            size="icon-xs"
            className="-top-1 -right-1 absolute"
            onClick={() => {
              removeFile(files[0]?.id);
              signalRef.current?.abort();
            }}
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
      </div>
      <input
        {...props}
        {...getInputProps()}
        aria-label="Upload image file"
        className="sr-only"
        tabIndex={-1}
        disabled={busy}
      />
    </>
  );
}
