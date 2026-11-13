"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
    ImageIcon,
    UploadCloud,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Cloud,
    RefreshCw,
    Sparkles,
} from "lucide-react";

interface HeroImageManagerProps {
    initialHeroImage: {
        imageUrl: string;
        publicId?: string | null;
        altText?: string | null;
        updatedAt?: string | null;
    };
}

export default function HeroImageManager({ initialHeroImage }: HeroImageManagerProps) {
    const [currentImage, setCurrentImage] = useState(initialHeroImage);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setMessage(null);
        }
    };

    const handleCancelPreview = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage({ type: "error", text: "Please select an image file first." });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("altText", "Student studying biology and chemistry");

            const res = await fetch("/api/admin/hero-image", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Upload failed");
            }

            const data = await res.json();
            setCurrentImage(data.heroImage);
            handleCancelPreview();
            setMessage({
                type: "success",
                text: "Hero image replaced successfully! The new image is active on Cloudinary and the previous image was deleted from Cloudinary.",
            });
        } catch (error: any) {
            console.error("Failed to replace hero image:", error);
            setMessage({
                type: "error",
                text: error.message || "Failed to replace hero image. Please try again.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const isCloudinary = currentImage.imageUrl?.includes("cloudinary.com");

    return (
        <Card className="p-6 bg-white border border-border shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Homepage Hero Image</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Manage the primary hero student image on the home page. Replaced images are automatically deleted from your Cloudinary account.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Live Home Page
                    </a>
                </div>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
                        message.type === "success"
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                >
                    {message.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                        <p className="font-semibold">{message.type === "success" ? "Success" : "Error"}</p>
                        <p className="text-xs mt-0.5">{message.text}</p>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Current Active Image */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Currently Active on Homepage
                        </span>
                        {isCloudinary ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                                <Cloud className="h-3 w-3" />
                                Cloudinary
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                                Local Fallback
                            </span>
                        )}
                    </div>

                    <div className="relative rounded-2xl border border-border/80 bg-slate-50 p-4 flex items-center justify-center overflow-hidden min-h-[260px]">
                        <img
                            src={currentImage.imageUrl}
                            alt="Current hero"
                            className="max-h-64 w-auto object-contain rounded-xl shadow-sm"
                        />
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                        {currentImage.publicId && (
                            <p className="font-mono text-[11px] truncate">
                                <strong>Public ID:</strong> {currentImage.publicId}
                            </p>
                        )}
                        {currentImage.updatedAt && (
                            <p className="text-[11px]">
                                <strong>Last Updated:</strong>{" "}
                                {new Date(currentImage.updatedAt).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Replace Image Action Box */}
                <div className="space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                        Upload Replacement Image
                    </span>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                            previewUrl
                                ? "border-primary/50 bg-primary/5"
                                : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40"
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/jpg"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {previewUrl ? (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-primary flex items-center justify-center gap-1">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    New Image Selected for Upload
                                </p>
                                <div className="flex justify-center">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-h-48 w-auto object-contain rounded-xl shadow-md border"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Click to choose a different file
                                </p>
                            </div>
                        ) : (
                            <div className="py-6 space-y-2">
                                <UploadCloud className="h-10 w-10 text-muted-foreground/60 mx-auto" />
                                <div className="text-sm font-semibold text-foreground">
                                    Click or Drag & Drop to Select New Hero Image
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    PNG, JPG, or WebP. Transparent background recommended.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="flex-1"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading to Cloudinary...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Replace Hero Image
                                </>
                            )}
                        </Button>

                        {selectedFile && !isUploading && (
                            <Button
                                variant="outline"
                                onClick={handleCancelPreview}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                        <p className="font-semibold flex items-center gap-1.5">
                            <Cloud className="h-3.5 w-3.5 text-amber-700" />
                            Automatic Cloudinary Storage Cleanup
                        </p>
                        <p className="text-amber-800 text-[11px] leading-relaxed">
                            When you replace the hero image, the new file is stored in your Cloudinary account (<code className="font-mono">itestpapers/hero</code>) and the previous hero image is automatically destroyed from Cloudinary so no orphaned files remain.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}

