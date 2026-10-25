"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
    Image as ImageIcon,
    UploadCloud,
    Trash2,
    Plus,
    Loader2,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    X,
    Pencil,
    RefreshCw,
    ShieldAlert
} from "lucide-react";

export interface MaterialPreviewData {
    id: string;
    title: string;
    imageUrl: string;
    width?: number | null;
    height?: number | null;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

interface MaterialPreviewManagerProps {
    initialPreviews?: MaterialPreviewData[];
}

export default function MaterialPreviewManager({ initialPreviews = [] }: MaterialPreviewManagerProps) {
    const [previews, setPreviews] = useState<MaterialPreviewData[]>(initialPreviews);
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Editing state
    const [editingPreview, setEditingPreview] = useState<MaterialPreviewData | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
    const [editFileDims, setEditFileDims] = useState<{ width: number; height: number } | null>(null);
    const [editDimError, setEditDimError] = useState<string | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Add form states
    const [addTitle, setAddTitle] = useState("");
    const [addSelectedFile, setAddSelectedFile] = useState<File | null>(null);
    const [addFilePreviewUrl, setAddFilePreviewUrl] = useState<string | null>(null);
    const [addFileDims, setAddFileDims] = useState<{ width: number; height: number } | null>(null);
    const [addDimError, setAddDimError] = useState<string | null>(null);

    // Global notifications
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Helper to get required dimensions from the other image
    const getRequiredDimensions = (excludeId?: string): { width: number; height: number } | null => {
        const other = previews.find((p) => p.id !== excludeId);
        if (other && other.width && other.height) {
            return { width: other.width, height: other.height };
        }
        // If other exists but has no width/height, default to 640x800
        if (other) {
            return { width: 640, height: 800 };
        }
        return null;
    };

    // Helper to check image dimensions in the browser
    const inspectImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const dims = { width: img.naturalWidth, height: img.naturalHeight };
                URL.revokeObjectURL(url);
                resolve(dims);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load image file"));
            };
            img.src = url;
        });
    };

    // Handle file selection in Add form
    const handleAddFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setAddDimError("Please select a valid image file (.png, .jpg, .webp)");
            return;
        }

        try {
            const dims = await inspectImageDimensions(file);
            setAddFileDims(dims);
            setAddSelectedFile(file);
            setAddFilePreviewUrl(URL.createObjectURL(file));

            const reqDims = getRequiredDimensions();
            if (reqDims) {
                if (dims.width !== reqDims.width || dims.height !== reqDims.height) {
                    setAddDimError(
                        `Dimension Mismatch: Uploaded image is ${dims.width}x${dims.height}px. Both preview images must have the exact same dimensions. The other image is ${reqDims.width}x${reqDims.height}px. Please resize to ${reqDims.width}x${reqDims.height}px.`
                    );
                    return;
                }
            }

            setAddDimError(null);
            if (!addTitle) {
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                setAddTitle(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1));
            }
        } catch {
            setAddDimError("Failed to inspect image dimensions");
        }
    };

    // Handle submit in Add form
    const handleAddUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (previews.length >= 2) {
            setErrorMessage("Maximum limit of 2 preview images reached. You must delete an existing image to add a new one.");
            return;
        }

        if (!addSelectedFile) {
            setAddDimError("Please select an image file to upload.");
            return;
        }

        if (addDimError) {
            return;
        }

        setIsUploading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", addSelectedFile);
            formData.append("title", addTitle || "Sample Material");
            formData.append("order", String(previews.length + 1));

            const res = await fetch("/api/admin/previews", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Failed to upload image");
            }

            const newPreview = await res.json();
            setPreviews((prev) => [...prev, newPreview].sort((a, b) => (a.order || 0) - (b.order || 0)));
            setSuccessMessage(`"${newPreview.title}" uploaded to Cloudinary successfully!`);

            // Reset
            setAddSelectedFile(null);
            setAddFilePreviewUrl(null);
            setAddFileDims(null);
            setAddTitle("");
            setAddDimError(null);
            setIsAdding(false);
        } catch (err: any) {
            console.error("Upload error:", err);
            setErrorMessage(err.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    // Open Edit modal
    const startEditing = (preview: MaterialPreviewData) => {
        setEditingPreview(preview);
        setEditTitle(preview.title);
        setEditSelectedFile(null);
        setEditPreviewUrl(null);
        setEditFileDims(null);
        setEditDimError(null);
    };

    // Handle file selection in Edit modal
    const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setEditDimError("Please select a valid image file (.png, .jpg, .webp)");
            return;
        }

        try {
            const dims = await inspectImageDimensions(file);
            setEditFileDims(dims);
            setEditSelectedFile(file);
            setEditPreviewUrl(URL.createObjectURL(file));

            // Dimension validation against the other preview
            const reqDims = getRequiredDimensions(editingPreview?.id);
            if (reqDims) {
                if (dims.width !== reqDims.width || dims.height !== reqDims.height) {
                    setEditDimError(
                        `Dimension Mismatch: Selected replacement image is ${dims.width}x${dims.height}px. Both preview images must have the exact same dimensions. The other image is ${reqDims.width}x${reqDims.height}px. Please resize to ${reqDims.width}x${reqDims.height}px.`
                    );
                    return;
                }
            }
            setEditDimError(null);
        } catch {
            setEditDimError("Failed to inspect image dimensions");
        }
    };

    // Handle Save in Edit modal
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPreview) return;
        if (editDimError) return;

        setIsSavingEdit(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const formData = new FormData();
            formData.append("id", editingPreview.id);
            formData.append("title", editTitle || editingPreview.title);
            if (editSelectedFile) {
                formData.append("file", editSelectedFile);
            }

            const res = await fetch("/api/admin/previews", {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Failed to update preview");
            }

            const updated = await res.json();
            setPreviews((prev) =>
                prev.map((p) => (p.id === editingPreview.id ? { ...p, ...updated } : p))
            );
            setSuccessMessage(`"${editTitle || editingPreview.title}" updated successfully!`);
            setEditingPreview(null);
        } catch (err: any) {
            console.error("Edit error:", err);
            setErrorMessage(err.message || "Failed to update preview");
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Delete a preview
    const handleDelete = async (id: string) => {
        setDeletingId(id);
        setErrorMessage(null);
        try {
            const res = await fetch(`/api/admin/previews?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete preview");
            }

            setPreviews((prev) => prev.filter((p) => p.id !== id));
            setSuccessMessage("Image removed from home screen and Cloudinary successfully.");
            setConfirmDeleteId(null);
        } catch (err: any) {
            console.error("Delete error:", err);
            setErrorMessage(err.message || "Failed to delete preview image");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Card className="p-6 border border-border shadow-xs bg-card" id="preview-materials">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground whitespace-nowrap">
                            <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                            Homepage Material Previews
                        </h2>
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                                previews.length >= 2
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                        >
                            {previews.length} / 2 Slots Filled
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage the 2 sample test paper and notes images on the home page. Height and width must match between both images.
                    </p>
                </div>

                {previews.length < 2 && !isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> Add Preview Image
                    </Button>
                )}
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => setErrorMessage(null)} className="text-destructive hover:opacity-80">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Add New Form (Only when < 2 items) */}
            {isAdding && previews.length < 2 && (
                <form onSubmit={handleAddUpload} className="mt-6 p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                            <UploadCloud className="h-4 w-4 text-primary" /> Upload New Preview Image
                        </h3>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsAdding(false);
                                setAddSelectedFile(null);
                                setAddFilePreviewUrl(null);
                                setAddDimError(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>

                    {getRequiredDimensions() && (
                        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>
                                <strong>Required Dimensions:</strong> To ensure uniform layout, the new image must be exactly{" "}
                                <strong>
                                    {getRequiredDimensions()?.width} x {getRequiredDimensions()?.height} px
                                </strong>{" "}
                                to match the existing preview image.
                            </span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="add-preview-title">Image Title / Caption</Label>
                        <Input
                            id="add-preview-title"
                            placeholder="e.g. Sample Test Paper, Sample Chapter Notes"
                            value={addTitle}
                            onChange={(e) => setAddTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Select Image File</Label>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-background">
                            {addFilePreviewUrl ? (
                                <div className="flex flex-col items-center gap-3">
                                    <img
                                        src={addFilePreviewUrl}
                                        alt="Preview"
                                        className="max-h-48 rounded-lg object-contain border border-border shadow-xs"
                                    />
                                    {addFileDims && (
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${
                                                addDimError
                                                    ? "bg-destructive/10 text-destructive border-destructive/30"
                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            }`}
                                        >
                                            {addFileDims.width} x {addFileDims.height} px
                                        </Badge>
                                    )}
                                    <p className="text-xs text-muted-foreground">{addSelectedFile?.name}</p>
                                    <label
                                        htmlFor="add-file-input"
                                        className="text-xs font-semibold text-primary cursor-pointer hover:underline"
                                    >
                                        Change image
                                    </label>
                                </div>
                            ) : (
                                <label htmlFor="add-file-input" className="cursor-pointer block">
                                    <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm font-medium text-foreground">Click to select image</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or WEBP</p>
                                </label>
                            )}
                            <input
                                id="add-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleAddFileChange}
                                className="hidden"
                            />
                        </div>

                        {addDimError && (
                            <p className="text-xs font-semibold text-destructive mt-1 flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {addDimError}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsAdding(false);
                                setAddSelectedFile(null);
                                setAddFilePreviewUrl(null);
                                setAddDimError(null);
                            }}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUploading || !addSelectedFile || !!addDimError} className="gap-2">
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading to Cloudinary...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="h-4 w-4" /> Upload & Save
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {/* Edit Modal / Card */}
            {editingPreview && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                <Pencil className="h-4 w-4 text-primary" /> Edit Preview Image
                            </h3>
                            <button
                                onClick={() => setEditingPreview(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {getRequiredDimensions(editingPreview.id) && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>
                                    <strong>Required Dimensions:</strong> If replacing this image, the new file must be exactly{" "}
                                    <strong>
                                        {getRequiredDimensions(editingPreview.id)?.width} x{" "}
                                        {getRequiredDimensions(editingPreview.id)?.height} px
                                    </strong>{" "}
                                    to match the other preview image.
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Image Title / Caption</Label>
                                <Input
                                    id="edit-title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Current Image</Label>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                                    <img
                                        src={editPreviewUrl || editingPreview.imageUrl}
                                        alt={editingPreview.title}
                                        className="h-16 w-16 object-contain rounded-lg bg-white border border-border"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate">
                                            {editSelectedFile ? editSelectedFile.name : editingPreview.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Dimensions:{" "}
                                            <strong>
                                                {editFileDims
                                                    ? `${editFileDims.width} x ${editFileDims.height} px`
                                                    : `${editingPreview.width || 640} x ${editingPreview.height || 800} px`}
                                            </strong>
                                        </p>
                                        {editSelectedFile && (
                                            <span className="text-[10px] text-emerald-600 font-medium">New image selected</span>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="edit-file-input"
                                        className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg font-semibold cursor-pointer shrink-0 transition-colors"
                                    >
                                        Replace Image
                                    </label>
                                    <input
                                        id="edit-file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditFileChange}
                                        className="hidden"
                                    />
                                </div>

                                {editDimError && (
                                    <p className="text-xs font-semibold text-destructive mt-1 flex items-center gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        {editDimError}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingPreview(null)}
                                    disabled={isSavingEdit}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSavingEdit || !!editDimError} className="gap-2">
                                    {isSavingEdit ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4" /> Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List of Previews (Cards) */}
            <div className="mt-6">
                {previews.length === 0 ? (
                    <div className="text-center py-10 border border-dashed rounded-2xl bg-muted/20">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                        <p className="font-semibold text-foreground">No material preview images yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Click &quot;Add Preview Image&quot; above to upload a sample test paper or notes page.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                        {previews.map((item, idx) => {
                            const isCloudinary = item.imageUrl.includes("cloudinary.com");
                            const dimsText = `${item.width || 640} x ${item.height || 800} px`;

                            return (
                                <div
                                    key={item.id}
                                    className="border border-border rounded-2xl p-4 bg-background flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-muted-foreground">
                                                Position #{item.order || idx + 1}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700">
                                                    {dimsText}
                                                </Badge>
                                                {isCloudinary ? (
                                                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                                        Cloudinary
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                                                        Local / Static
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="overflow-hidden rounded-xl bg-slate-50 border border-slate-100 aspect-[4/3] flex items-center justify-center p-2 mb-3 relative group">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                            <a
                                                href={item.imageUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 rounded-lg"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" /> View Full Image
                                            </a>
                                        </div>

                                        <h4 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h4>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.imageUrl}</p>
                                    </div>

                                    <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs flex items-center gap-1.5"
                                            onClick={() => startEditing(item)}
                                        >
                                            <Pencil className="h-3.5 w-3.5 text-primary" /> Edit / Replace
                                        </Button>

                                        {confirmDeleteId === item.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8 text-xs px-2.5"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={deletingId === item.id}
                                                >
                                                    {deletingId === item.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        "Confirm Delete"
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-xs px-2"
                                                    onClick={() => setConfirmDeleteId(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 text-xs flex items-center gap-1.5"
                                                onClick={() => setConfirmDeleteId(item.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Card>
    );
}
