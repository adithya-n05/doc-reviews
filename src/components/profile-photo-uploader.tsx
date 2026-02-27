"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type ProfilePhotoUploaderProps = {
  initialAvatarUrl: string | null;
  avatarAlt: string;
};

type AvatarApiResponse = {
  ok?: boolean;
  avatarUrl?: string;
  error?: string;
};

export function ProfilePhotoUploader({
  initialAvatarUrl,
  avatarAlt,
}: ProfilePhotoUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [pendingUpload, setPendingUpload] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function revokeObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      revokeObjectUrl();
    };
  }, []);

  function handleFileSelection(file: File | null) {
    revokeObjectUrl();
    setError("");
    setMessage("");

    if (!file) {
      setSelectedFile(null);
      setSelectedFileName("");
      setPreviewUrl(initialAvatarUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setPreviewUrl(objectUrl);
  }

  async function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile || pendingUpload || pendingRemove) {
      return;
    }

    setPendingUpload(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("avatarFile", selectedFile);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as AvatarApiResponse;
      if (!response.ok || payload.ok !== true || !payload.avatarUrl) {
        throw new Error(payload.error ?? "Unable to upload profile photo.");
      }

      revokeObjectUrl();
      setSelectedFile(null);
      setSelectedFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewUrl(payload.avatarUrl);
      setMessage("Profile photo updated.");
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload profile photo.");
    } finally {
      setPendingUpload(false);
    }
  }

  async function handleRemove() {
    if (!previewUrl || pendingUpload || pendingRemove) {
      return;
    }

    const previousPreview = previewUrl;
    setPendingRemove(true);
    setError("");
    setMessage("");
    revokeObjectUrl();
    setSelectedFile(null);
    setSelectedFileName("");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });
      const payload = (await response.json()) as AvatarApiResponse;
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error ?? "Unable to remove profile photo.");
      }

      setMessage("Profile photo removed.");
      router.refresh();
    } catch (removeError) {
      setPreviewUrl(previousPreview);
      setError(removeError instanceof Error ? removeError.message : "Unable to remove profile photo.");
    } finally {
      setPendingRemove(false);
    }
  }

  return (
    <div>
      <div className="profile-photo-controls">
        <form className="profile-photo-upload-form" onSubmit={handleUploadSubmit}>
          <label className="profile-photo-dropzone">
            <input
              ref={fileInputRef}
              className="profile-photo-file-input"
              name="avatarFile"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;
                handleFileSelection(file);
              }}
              required
            />
            <span className="profile-photo-dropzone-label">
              Drag and drop a photo here, or click to browse.
            </span>
            <span className="profile-photo-dropzone-meta">
              PNG, JPG, or WEBP. Maximum file size 5MB.
            </span>
            {selectedFileName ? (
              <span className="profile-photo-selected">Selected: {selectedFileName}</span>
            ) : null}
          </label>
          <div className="profile-photo-action-group">
            <button
              className="btn btn-primary btn-sm profile-photo-action-btn"
              disabled={!selectedFile || pendingUpload || pendingRemove}
              type="submit"
            >
              {pendingUpload ? "Saving..." : "Save Photo"}
            </button>
          </div>
        </form>
        <div className="profile-photo-action-group">
          <button
            className="btn btn-ghost btn-sm profile-photo-action-btn"
            disabled={!previewUrl || pendingUpload || pendingRemove}
            onClick={() => {
              void handleRemove();
            }}
            type="button"
          >
            {pendingRemove ? "Removing..." : "Remove Photo"}
          </button>
        </div>
      </div>
      <div className="profile-photo-preview">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="profile-photo-preview-image" src={previewUrl} alt={avatarAlt} />
        ) : (
          <span className="profile-photo-preview-empty">No photo selected.</span>
        )}
      </div>
      {message ? <p className="form-note profile-photo-success">{message}</p> : null}
      {error ? <p className="form-note profile-photo-error">{error}</p> : null}
    </div>
  );
}
