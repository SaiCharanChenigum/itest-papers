"use client";

import { useState, useRef, useEffect } from "react";
import { BannerData, BannerElement } from "@/lib/banner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
    Type,
    Shapes,
    Image as ImageIcon,
    Palette,
    Trash2,
    Copy,
    Save,
    RefreshCw,
    CheckCircle2,
    Loader2,
    ExternalLink,
    Layers,
    ArrowUp,
    ArrowDown,
    ChevronsUp,
    ChevronsDown,
    Plus,
    Move,
    Eye,
    EyeOff,
    Link as LinkIcon,
    Maximize2,
    Minimize2,
    AlignCenter,
    Bold,
    Minus,
} from "lucide-react";

interface BannerStudioProps {
    initialBanner: BannerData;
}

const COLOR_PRESETS = [
    { label: "Transparent / Seamless", value: "transparent" },
    { label: "Plain White", value: "#ffffff" },
    { label: "Pearl Slate", value: "#f8fafc" },
    { label: "Soft Teal", value: "#f0fdfa" },
    { label: "Soft Blue", value: "#eff6ff" },
    { label: "Warm Amber", value: "#fffbeb" },
    { label: "Soft Rose", value: "#fff1f2" },
    { label: "Deep Slate", value: "#0f172a" },
    { label: "Midnight Dark", value: "#18181b" },
];

const REF_WIDTH = 1200;
const FIXED_BANNER_HEIGHT = 200; // Fixed height matching homepage banner

export default function BannerStudio({ initialBanner }: BannerStudioProps) {
    const [banner, setBanner] = useState<BannerData>(initialBanner);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedElement = banner.elements.find((el) => el.id === selectedId) || null;
    const refHeight = FIXED_BANNER_HEIGHT;

    // Dragging & Resizing state
    const [isDragging, setIsDragging] = useState(false);
    const [resizingHandle, setResizingHandle] = useState<string | null>(null);
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialElX: number; initialElY: number } | null>(null);
    const resizeStartRef = useRef<{
        mouseX: number;
        mouseY: number;
        initialX: number;
        initialY: number;
        initialWidth: number;
        initialHeight: number;
    } | null>(null);

    const handleMouseDown = (e: React.MouseEvent, elId: string) => {
        e.stopPropagation();
        setSelectedId(elId);
        setIsDragging(true);

        const targetEl = banner.elements.find((el) => el.id === elId);
        if (targetEl) {
            dragStartRef.current = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                initialElX: targetEl.x,
                initialElY: targetEl.y,
            };
        }
    };

    const handleTouchStart = (e: React.TouchEvent, elId: string) => {
        e.stopPropagation();
        setSelectedId(elId);
        setIsDragging(true);

        const touch = e.touches[0];
        const targetEl = banner.elements.find((el) => el.id === elId);
        if (targetEl && touch) {
            dragStartRef.current = {
                mouseX: touch.clientX,
                mouseY: touch.clientY,
                initialElX: targetEl.x,
                initialElY: targetEl.y,
            };
        }
    };

    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: string, el: BannerElement) => {
        e.stopPropagation();
        setResizingHandle(handle);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        resizeStartRef.current = {
            mouseX: clientX,
            mouseY: clientY,
            initialX: el.x,
            initialY: el.y,
            initialWidth: el.width || (el.type === 'image' ? 300 : el.type === 'shape' ? 180 : 250),
            initialHeight: el.height || (el.type === 'image' ? 180 : el.type === 'shape' ? 50 : 50),
        };
    };

    // Quick size presets right at the element (like Word / Canva)
    const handleQuickScale = (multiplier: number) => {
        if (!selectedElement) return;
        const curW = selectedElement.width || 300;
        const curH = selectedElement.height || 180;
        const newW = Math.max(40, Math.min(3000, Math.round(curW * multiplier)));
        const newH = Math.max(20, Math.min(1500, Math.round(curH * multiplier)));
        updateSelected({ width: newW, height: newH, objectFit: selectedElement.objectFit || "cover" });
    };

    const handleFitHeight = () => {
        if (!selectedElement) return;
        updateSelected({ y: 0, height: refHeight, objectFit: selectedElement.objectFit || "cover" });
    };

    const handleFullWidth = () => {
        if (!selectedElement) return;
        updateSelected({ x: 0, y: 0, width: REF_WIDTH, height: refHeight, objectFit: "cover" });
    };

    const handleCenterElement = () => {
        if (!selectedElement) return;
        const w = selectedElement.width || 300;
        const h = selectedElement.height || 50;
        updateSelected({
            x: Math.max(0, Math.round((REF_WIDTH - w) / 2)),
            y: Math.max(0, Math.round((refHeight - h) / 2)),
        });
    };

    const handleStepFontSize = (delta: number) => {
        if (!selectedElement) return;
        const cur = selectedElement.fontSize || 24;
        updateSelected({ fontSize: Math.max(12, Math.min(64, cur + delta)) });
    };

    useEffect(() => {
        const handleMove = (clientX: number, clientY: number) => {
            if (!canvasRef.current || !selectedId) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const scaleX = REF_WIDTH / rect.width;
            const scaleY = refHeight / rect.height;

            // 1. Resizing mode
            if (resizingHandle && resizeStartRef.current) {
                const deltaX = (clientX - resizeStartRef.current.mouseX) * scaleX;
                const deltaY = (clientY - resizeStartRef.current.mouseY) * scaleY;
                const start = resizeStartRef.current;

                setBanner((prev) => ({
                    ...prev,
                    elements: prev.elements.map((el) => {
                        if (el.id !== selectedId) return el;
                        let newW = start.initialWidth;
                        let newH = start.initialHeight;
                        let newX = start.initialX;
                        let newY = start.initialY;

                        if (resizingHandle.includes('e')) {
                            let calculatedW = Math.round(start.initialWidth + deltaX);
                            if (newX <= 10 && Math.abs(calculatedW - REF_WIDTH) < 50) {
                                calculatedW = REF_WIDTH;
                                newX = 0;
                            }
                            newW = Math.max(40, Math.min(3000, calculatedW));
                        }
                        if (resizingHandle.includes('s')) {
                            let calculatedH = Math.round(start.initialHeight + deltaY);
                            if (newY <= 10 && Math.abs(calculatedH - refHeight) < 25) {
                                calculatedH = refHeight;
                                newY = 0;
                            }
                            newH = Math.max(20, Math.min(1500, calculatedH));
                        }
                        if (resizingHandle.includes('w')) {
                            newW = Math.max(40, Math.round(start.initialWidth - deltaX));
                            newX = Math.round(start.initialX + deltaX);
                        }
                        if (resizingHandle.includes('n')) {
                            newH = Math.max(20, Math.round(start.initialHeight - deltaY));
                            newY = Math.round(start.initialY + deltaY);
                        }

                        return {
                            ...el,
                            x: newX,
                            y: newY,
                            width: newW,
                            height: newH,
                        };
                    }),
                }));
                return;
            }

            // 2. Dragging mode
            if (isDragging && dragStartRef.current) {
                const deltaX = (clientX - dragStartRef.current.mouseX) * scaleX;
                const deltaY = (clientY - dragStartRef.current.mouseY) * scaleY;

                // Allow free dragging (including negative coordinates so zoomed images can be positioned/framed freely)
                const newX = Math.round(dragStartRef.current.initialElX + deltaX);
                const newY = Math.round(dragStartRef.current.initialElY + deltaY);

                setBanner((prev) => ({
                    ...prev,
                    elements: prev.elements.map((el) =>
                        el.id === selectedId ? { ...el, x: newX, y: newY } : el
                    ),
                }));
            }
        };

        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
        };

        const onEnd = () => {
            setIsDragging(false);
            dragStartRef.current = null;
            setResizingHandle(null);
            resizeStartRef.current = null;
        };

        if (isDragging || resizingHandle) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onEnd);
            window.addEventListener("touchmove", onTouchMove, { passive: true });
            window.addEventListener("touchend", onEnd);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onEnd);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onEnd);
        };
    }, [isDragging, resizingHandle, selectedId, refHeight]);

    // Add Text Element
    const handleAddText = (preset: "headline" | "subtitle" | "badge") => {
        const id = "el_" + Date.now();
        let newEl: BannerElement;

        if (preset === "headline") {
            newEl = {
                id,
                type: "text",
                text: "Special Announcement / New Test Papers!",
                x: 60,
                y: 60,
                fontSize: 32,
                fontWeight: "bold",
                color: banner.backgroundColor === "#0f172a" || banner.backgroundColor === "#18181b" ? "#ffffff" : "#0f172a",
                textAlign: "left",
            };
        } else if (preset === "subtitle") {
            newEl = {
                id,
                type: "text",
                text: "Comprehensive ICSE Class 9 & 10 study material prepared by top educators.",
                x: 60,
                y: 120,
                fontSize: 16,
                fontWeight: "normal",
                color: banner.backgroundColor === "#0f172a" || banner.backgroundColor === "#18181b" ? "#94a3b8" : "#475569",
                textAlign: "left",
            };
        } else {
            newEl = {
                id,
                type: "text",
                text: "Explore Now →",
                x: 60,
                y: 180,
                fontSize: 15,
                fontWeight: "bold",
                color: "#ffffff",
                textAlign: "center",
                linkUrl: "/pricing",
            };
        }

        setBanner((prev) => ({
            ...prev,
            elements: [...prev.elements, newEl],
        }));
        setSelectedId(id);
    };

    // Add Shape Element
    const handleAddShape = (shapeType: "rectangle" | "rounded-pill" | "badge" | "circle" | "line") => {
        const id = "el_" + Date.now();
        const newEl: BannerElement = {
            id,
            type: "shape",
            shapeType,
            x: shapeType === "line" ? 60 : 50,
            y: shapeType === "line" ? 160 : 170,
            width: shapeType === "line" ? 880 : shapeType === "rounded-pill" ? 150 : 200,
            height: shapeType === "line" ? 2 : shapeType === "rounded-pill" ? 44 : 120,
            fillColor: shapeType === "line" ? "#cbd5e1" : "#0284c7",
            borderColor: "transparent",
            borderWidth: 0,
            opacity: 1,
        };

        setBanner((prev) => ({
            ...prev,
            elements: [...prev.elements, newEl],
        }));
        setSelectedId(id);
    };

    // Add Image Element (Uploads to Cloudinary)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        setSaveMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/banner/upload-image", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || "Image upload failed");
            }

            const data = await res.json();
            const id = "el_" + Date.now();

            const newEl: BannerElement = {
                id,
                type: "image",
                imageUrl: data.imageUrl,
                publicId: data.publicId,
                x: 720,
                y: 40,
                width: 220,
                height: 180,
                borderRadius: 12,
            };

            setBanner((prev) => ({
                ...prev,
                elements: [...prev.elements, newEl],
            }));
            setSelectedId(id);
        } catch (error: any) {
            console.error("Banner image upload error:", error);
            alert(`Failed to upload image: ${error.message || "Unknown error"}`);
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Update Selected Element
    const updateSelected = (updates: Partial<BannerElement>) => {
        if (!selectedId) return;
        setBanner((prev) => ({
            ...prev,
            elements: prev.elements.map((el) => (el.id === selectedId ? { ...el, ...updates } : el)),
        }));
    };

    // Delete Selected Element
    const handleDeleteSelected = () => {
        if (!selectedId) return;
        setBanner((prev) => ({
            ...prev,
            elements: prev.elements.filter((el) => el.id !== selectedId),
        }));
        setSelectedId(null);
    };

    // Duplicate Selected Element
    const handleDuplicateSelected = () => {
        if (!selectedElement) return;
        const newId = "el_" + Date.now();
        const copy: BannerElement = {
            ...selectedElement,
            id: newId,
            x: Math.min(REF_WIDTH - 50, selectedElement.x + 20),
            y: Math.min(refHeight - 30, selectedElement.y + 20),
        };
        setBanner((prev) => ({
            ...prev,
            elements: [...prev.elements, copy],
        }));
        setSelectedId(newId);
    };

    // Layer ordering (Bring to Front, Send to Back, Forward, Backward)
    const handleMoveLayer = (direction: "up" | "down" | "front" | "back") => {
        if (!selectedId) return;
        const index = banner.elements.findIndex((el) => el.id === selectedId);
        if (index === -1) return;

        const newElements = [...banner.elements];
        const [targetEl] = newElements.splice(index, 1);

        if (direction === "front") {
            newElements.push(targetEl);
        } else if (direction === "back") {
            newElements.unshift(targetEl);
        } else if (direction === "up") {
            const newIndex = Math.min(newElements.length, index + 1);
            newElements.splice(newIndex, 0, targetEl);
        } else if (direction === "down") {
            const newIndex = Math.max(0, index - 1);
            newElements.splice(newIndex, 0, targetEl);
        }

        setBanner((prev) => ({ ...prev, elements: newElements }));
    };

    // Save Banner to Database
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const res = await fetch("/api/admin/banner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(banner),
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || "Save failed");
            }

            const data = await res.json();
            setBanner(data.banner);
            setSaveMessage({
                type: "success",
                text: "Homepage banner saved successfully! Changes are live above the 'Choose Your Subject' section.",
            });
        } catch (error: any) {
            console.error("Failed to save banner:", error);
            setSaveMessage({
                type: "error",
                text: error.message || "Failed to save banner.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Reset to Plain White Canvas
    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset this banner back to a plain white canvas? All elements will be removed.")) {
            setBanner({
                id: "current",
                isActive: true,
                backgroundColor: "#ffffff",
                height: 260,
                elements: [],
            });
            setSelectedId(null);
            setSaveMessage({
                type: "success",
                text: "Banner reset to plain white canvas. Click 'Save Banner' to apply changes to the live site.",
            });
        }
    };

    return (
        <Card className="p-6 bg-white border border-border shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Shapes className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Homepage Banner Studio</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Design a custom rectangular banner placed above the <strong>"Choose Your Subject"</strong> section on the homepage. Add text, shapes, images, and change colors.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle Active Switch */}
                    <button
                        type="button"
                        onClick={() => setBanner((prev) => ({ ...prev, isActive: !prev.isActive }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            banner.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-muted text-muted-foreground border-border"
                        }`}
                    >
                        {banner.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {banner.isActive ? "Visible on Homepage" : "Hidden from Homepage"}
                    </button>

                    <a
                        href="/#subjects"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Live Placement
                    </a>
                </div>
            </div>

            {/* Notification message */}
            {saveMessage && (
                <div
                    className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
                        saveMessage.type === "success"
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">{saveMessage.type === "success" ? "Saved" : "Notice"}</p>
                        <p className="text-xs mt-0.5">{saveMessage.text}</p>
                    </div>
                </div>
            )}

            {/* Studio Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase mr-1">Add:</span>

                    {/* Add Text Dropdown/Buttons */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddText("headline")}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Type className="h-3.5 w-3.5" /> Heading
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddText("subtitle")}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Type className="h-3.5 w-3.5" /> Subtitle
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddText("badge")}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" /> CTA Text
                    </Button>

                    <span className="text-slate-300">|</span>

                    {/* Add Shapes */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddShape("rectangle")}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Shapes className="h-3.5 w-3.5" /> Box
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddShape("rounded-pill")}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Shapes className="h-3.5 w-3.5" /> Pill / Badge
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddShape("circle")}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Shapes className="h-3.5 w-3.5" /> Circle
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddShape("line")}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Shapes className="h-3.5 w-3.5" /> Line
                    </Button>

                    <span className="text-slate-300">|</span>

                    {/* Add Image */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="h-8 text-xs gap-1.5"
                    >
                        {isUploadingImage ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <ImageIcon className="h-3.5 w-3.5 text-primary" />
                        )}
                        Upload Image
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>

                {/* Right tools: Save & Reset */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReset}
                        className="h-8 text-xs text-muted-foreground hover:text-destructive"
                    >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Plain White Canvas
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm"
                    >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save Banner
                    </Button>
                </div>
            </div>

            {/* Background Fill Palette */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5" /> Canvas Fill Color:
                </span>
                {COLOR_PRESETS.map((color) => (
                    <button
                        key={color.value}
                        type="button"
                        onClick={() => setBanner((prev) => ({ ...prev, backgroundColor: color.value }))}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all ${
                            banner.backgroundColor === color.value
                                ? "ring-2 ring-primary font-semibold border-primary"
                                : "hover:border-slate-400"
                        }`}
                    >
                        <span
                            className="w-3.5 h-3.5 rounded-full border shadow-xs"
                            style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                    </button>
                ))}
                {/* Custom Color Picker */}
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer hover:border-slate-400">
                    <input
                        type="color"
                        value={banner.backgroundColor.startsWith("#") ? banner.backgroundColor : "#ffffff"}
                        onChange={(e) => setBanner((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0"
                    />
                    <span>Custom</span>
                </label>
            </div>

            {/* Visual Canvas Workspace */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold">Interactive Canvas (Click & Drag Elements to Position):</span>
                    <span>{banner.elements.length} element{banner.elements.length === 1 ? "" : "s"}</span>
                </div>

                <div
                    ref={canvasRef}
                    onClick={(e) => {
                        if (e.target === canvasRef.current) {
                            setSelectedId(null);
                        }
                    }}
                    className="w-full relative rounded-none border-2 border-slate-300 shadow-sm overflow-hidden select-none cursor-default transition-all"
                    style={{
                        backgroundColor: banner.backgroundColor || "#ffffff",
                        height: `${FIXED_BANNER_HEIGHT}px`,
                    }}
                >
                    {banner.elements.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                                Plain White Canvas
                            </span>
                            <p className="text-xs text-slate-400 max-w-sm">
                                Use the toolbar above to add text, buttons, shapes, or upload images. Drag them to any position!
                            </p>
                        </div>
                    )}

                    {banner.elements.map((el, index) => {
                        const isSelected = el.id === selectedId;
                        const stackZIndex = 10 + index * 5;
                        const isFullBleed = (el.width || 0) >= REF_WIDTH && (el.x || 0) <= 0;
                        const leftPercent = (el.x / REF_WIDTH) * 100;
                        const topPercent = (el.y / refHeight) * 100;
                        const widthPercent = el.width ? (el.width / REF_WIDTH) * 100 : undefined;
                        const heightPercent = el.height ? (el.height / refHeight) * 100 : undefined;

                        return (
                            <div
                                key={el.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(el.id);
                                }}
                                onMouseDown={(e) => handleMouseDown(e, el.id)}
                                onTouchStart={(e) => handleTouchStart(e, el.id)}
                                className={`absolute cursor-move transition-shadow ${
                                    isSelected
                                        ? "ring-2 ring-primary ring-offset-1 shadow-lg"
                                        : "hover:ring-1 hover:ring-primary/40"
                                }`}
                                style={{
                                    left: isFullBleed ? "0%" : `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                    width: isFullBleed ? "100%" : (widthPercent ? `${widthPercent}%` : "max-content"),
                                    height: heightPercent ? `${heightPercent}%` : "auto",
                                    zIndex: stackZIndex,
                                }}
                            >
                                {el.type === "text" && (
                                    <div
                                        style={{
                                            color: el.color || "#0f172a",
                                            fontWeight: el.fontWeight || "bold",
                                            textAlign: el.textAlign || "left",
                                            fontSize: `clamp(12px, ${(el.fontSize || 20) / 10}vw, ${el.fontSize || 20}px)`,
                                            lineHeight: 1.25,
                                            whiteSpace: "pre-wrap",
                                        }}
                                        className="p-1"
                                    >
                                        {el.text}
                                    </div>
                                )}

                                {el.type === "shape" && (
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundColor: el.fillColor || "#3b82f6",
                                            borderColor: el.borderColor || "transparent",
                                            borderWidth: el.borderWidth ? `${el.borderWidth}px` : "0px",
                                            borderStyle: el.borderWidth ? "solid" : "none",
                                            borderRadius:
                                                el.shapeType === "circle"
                                                    ? "50%"
                                                    : el.shapeType === "rounded-pill"
                                                    ? "9999px"
                                                    : el.shapeType === "badge"
                                                    ? "12px"
                                                    : el.shapeType === "line"
                                                    ? "1px"
                                                    : "8px",
                                            opacity: el.opacity ?? 1,
                                        }}
                                    />
                                )}

                                {el.type === "image" && el.imageUrl && (
                                    <div
                                        className="w-full h-full overflow-hidden"
                                        style={{
                                            borderRadius: el.borderRadius ? `${el.borderRadius}px` : "0px",
                                        }}
                                    >
                                        <img
                                            src={el.imageUrl}
                                            alt="Banner element"
                                            className="w-full h-full pointer-events-none"
                                            style={{
                                                objectFit: el.objectFit || "cover",
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Word / Canva style Interactive Resize Handles & On-Element Quick Options */}
                                {isSelected && (
                                    <>
                                        {/* Floating Mini Action Toolbar directly above element */}
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute -top-10 left-0 flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-lg shadow-xl text-xs z-50 whitespace-nowrap select-none pointer-events-auto"
                                        >
                                            {el.type === "image" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={handleFitHeight}
                                                        title="Fit Banner Height (200px)"
                                                        className="px-2 py-0.5 rounded hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1 text-sky-400"
                                                    >
                                                        <Maximize2 className="h-3 w-3" /> Fit Height
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleFullWidth}
                                                        title="Fill Full Banner (1000x200)"
                                                        className="px-2 py-0.5 rounded hover:bg-slate-800 text-[11px] font-semibold text-emerald-400"
                                                    >
                                                        Full Banner
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCenterElement}
                                                        title="Center on Canvas"
                                                        className="px-2 py-0.5 rounded hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1"
                                                    >
                                                        <AlignCenter className="h-3 w-3" /> Center
                                                    </button>
                                                    <span className="text-slate-600">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickScale(0.9)}
                                                        title="Decrease Size (-10%)"
                                                        className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickScale(1.1)}
                                                        title="Increase Size (+10%)"
                                                        className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </>
                                            )}

                                            {el.type === "text" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStepFontSize(-2)}
                                                        title="Decrease Font Size"
                                                        className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-[11px] font-semibold"
                                                    >
                                                        A-
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStepFontSize(2)}
                                                        title="Increase Font Size"
                                                        className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-[11px] font-semibold text-sky-400"
                                                    >
                                                        A+
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateSelected({
                                                                fontWeight: el.fontWeight === "bold" ? "normal" : "bold",
                                                            })
                                                        }
                                                        title="Toggle Bold"
                                                        className={`p-1 rounded hover:bg-slate-800 ${
                                                            el.fontWeight === "bold" ? "bg-slate-800 text-sky-400" : ""
                                                        }`}
                                                    >
                                                        <Bold className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCenterElement}
                                                        title="Center Text on Canvas"
                                                        className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-[11px]"
                                                    >
                                                        <AlignCenter className="h-3 w-3" />
                                                    </button>
                                                </>
                                            )}

                                            {el.type === "shape" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={handleFitHeight}
                                                        title="Fit Height"
                                                        className="px-2 py-0.5 rounded hover:bg-slate-800 text-[11px] text-sky-400"
                                                    >
                                                        Fit Height
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleFullWidth}
                                                        title="Full Width Strip"
                                                        className="px-2 py-0.5 rounded hover:bg-slate-800 text-[11px] text-emerald-400"
                                                    >
                                                        Full Strip
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCenterElement}
                                                        title="Center on Canvas"
                                                        className="px-2 py-0.5 rounded hover:bg-slate-800 text-[11px]"
                                                    >
                                                        <AlignCenter className="h-3 w-3" />
                                                    </button>
                                                </>
                                            )}

                                            <span className="text-slate-600">|</span>
                                            {/* Stack Layer Ordering Quick Buttons */}
                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveLayer("front")}
                                                    title="Bring to Front (Top of Stack)"
                                                    className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-[10px] font-semibold text-amber-400 flex items-center gap-0.5"
                                                >
                                                    <ChevronsUp className="h-3 w-3" /> Front
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveLayer("up")}
                                                    title="Bring Forward (+1 Layer)"
                                                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveLayer("down")}
                                                    title="Send Backward (-1 Layer)"
                                                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveLayer("back")}
                                                    title="Send to Back (Bottom of Stack)"
                                                    className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-[10px] font-semibold text-slate-400 hover:text-white flex items-center gap-0.5"
                                                >
                                                    <ChevronsDown className="h-3 w-3" /> Back
                                                </button>
                                            </div>

                                            <span className="text-slate-600">|</span>
                                            <button
                                                type="button"
                                                onClick={handleDuplicateSelected}
                                                title="Duplicate"
                                                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDeleteSelected}
                                                title="Delete"
                                                className="p-1 rounded hover:bg-red-950 text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>

                                        {/* Word / Canva interactive corner & edge resize handles */}
                                        {/* Top-Left */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, "nw", el)}
                                            onTouchStart={(e) => handleResizeStart(e, "nw", el)}
                                            className="w-3.5 h-3.5 bg-white border-2 border-primary rounded-xs absolute -top-1.5 -left-1.5 cursor-nwse-resize shadow-md z-40 hover:scale-125 transition-transform"
                                        />
                                        {/* Top-Right */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, "ne", el)}
                                            onTouchStart={(e) => handleResizeStart(e, "ne", el)}
                                            className="w-3.5 h-3.5 bg-white border-2 border-primary rounded-xs absolute -top-1.5 -right-1.5 cursor-nesw-resize shadow-md z-40 hover:scale-125 transition-transform"
                                        />
                                        {/* Bottom-Left */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, "sw", el)}
                                            onTouchStart={(e) => handleResizeStart(e, "sw", el)}
                                            className="w-3.5 h-3.5 bg-white border-2 border-primary rounded-xs absolute -bottom-1.5 -left-1.5 cursor-nesw-resize shadow-md z-40 hover:scale-125 transition-transform"
                                        />
                                        {/* Bottom-Right */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, "se", el)}
                                            onTouchStart={(e) => handleResizeStart(e, "se", el)}
                                            className="w-3.5 h-3.5 bg-white border-2 border-primary rounded-xs absolute -bottom-1.5 -right-1.5 cursor-nwse-resize shadow-md z-40 hover:scale-125 transition-transform"
                                        />
                                        {/* Middle-Right (Width drag handle) */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, "e", el)}
                                            onTouchStart={(e) => handleResizeStart(e, "e", el)}
                                            className="w-2.5 h-5 bg-white border-2 border-primary rounded-xs absolute top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize shadow-md z-40 hover:scale-125 transition-transform"
                                        />
                                        {/* Middle-Bottom (Height drag handle) */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, "s", el)}
                                            onTouchStart={(e) => handleResizeStart(e, "s", el)}
                                            className="w-5 h-2.5 bg-white border-2 border-primary rounded-xs absolute -bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize shadow-md z-40 hover:scale-125 transition-transform"
                                        />
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Element Property Inspector */}
            {selectedElement && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <Move className="h-3.5 w-3.5 text-primary" />
                                Edit Selected {selectedElement.type.toUpperCase()}:
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <Layers className="h-3 w-3 text-primary" />
                                Layer {banner.elements.findIndex((e) => e.id === selectedId) + 1} of {banner.elements.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMoveLayer("front")}
                                title="Bring to Front (Top of Stack)"
                                className="h-7 px-2 text-xs font-semibold text-amber-700 border-amber-300 hover:bg-amber-50 gap-1"
                            >
                                <ChevronsUp className="h-3.5 w-3.5" /> To Front
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMoveLayer("up")}
                                title="Bring Forward (+1 Layer)"
                                className="h-7 w-7 p-0"
                            >
                                <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMoveLayer("down")}
                                title="Send Backward (-1 Layer)"
                                className="h-7 w-7 p-0"
                            >
                                <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMoveLayer("back")}
                                title="Send to Back (Bottom of Stack)"
                                className="h-7 px-2 text-xs font-semibold text-slate-600 border-slate-300 hover:bg-slate-100 gap-1"
                            >
                                <ChevronsDown className="h-3.5 w-3.5" /> To Back
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDuplicateSelected}
                                title="Duplicate"
                                className="h-7 w-7 p-0"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDeleteSelected}
                                title="Delete"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Text Element Properties */}
                    {selectedElement.type === "text" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div className="sm:col-span-2 space-y-1">
                                <label className="font-semibold text-slate-600">Text Content:</label>
                                <input
                                    type="text"
                                    value={selectedElement.text || ""}
                                    onChange={(e) => updateSelected({ text: e.target.value })}
                                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-600">
                                    Font Size ({selectedElement.fontSize}px):
                                </label>
                                <input
                                    type="range"
                                    min="12"
                                    max="54"
                                    value={selectedElement.fontSize || 20}
                                    onChange={(e) => updateSelected({ fontSize: parseInt(e.target.value, 10) })}
                                    className="w-full accent-primary"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-600">Text Color:</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={selectedElement.color || "#0f172a"}
                                        onChange={(e) => updateSelected({ color: e.target.value })}
                                        className="w-8 h-8 rounded border p-0 cursor-pointer"
                                    />
                                    <span className="font-mono">{selectedElement.color}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-600">Font Weight:</label>
                                <select
                                    value={selectedElement.fontWeight || "bold"}
                                    onChange={(e) => updateSelected({ fontWeight: e.target.value })}
                                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="semibold">Semi Bold</option>
                                    <option value="bold">Bold</option>
                                    <option value="800">Extra Bold</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-600">Text Align:</label>
                                <select
                                    value={selectedElement.textAlign || "left"}
                                    onChange={(e) =>
                                        updateSelected({ textAlign: e.target.value as "left" | "center" | "right" })
                                    }
                                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                                <label className="font-semibold text-slate-600 flex items-center gap-1">
                                    <LinkIcon className="h-3 w-3" /> Optional Click URL (e.g. /pricing):
                                </label>
                                <input
                                    type="text"
                                    placeholder="Leave empty or enter /pricing"
                                    value={selectedElement.linkUrl || ""}
                                    onChange={(e) => updateSelected({ linkUrl: e.target.value })}
                                    className="w-full px-3 py-1.5 border rounded-lg bg-white font-mono"
                                />
                            </div>
                        </div>
                    )}

                    {/* Shape Element Properties */}
                    {selectedElement.type === "shape" && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-600">Shape Type:</label>
                                <select
                                    value={selectedElement.shapeType || "rectangle"}
                                    onChange={(e) => updateSelected({ shapeType: e.target.value as any })}
                                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                                >
                                    <option value="rectangle">Rectangle</option>
                                    <option value="rounded-pill">Rounded Pill</option>
                                    <option value="badge">Badge</option>
                                    <option value="circle">Circle</option>
                                    <option value="line">Line</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-600">Fill Color:</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={selectedElement.fillColor || "#0284c7"}
                                        onChange={(e) => updateSelected({ fillColor: e.target.value })}
                                        className="w-8 h-8 rounded border p-0 cursor-pointer"
                                    />
                                    <span className="font-mono">{selectedElement.fillColor}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-600 flex items-center justify-between">
                                    <span>Width:</span>
                                    <span className="font-mono text-primary font-bold">
                                        {selectedElement.width || 100}px ({Math.round(((selectedElement.width || 100) / REF_WIDTH) * 100)}%)
                                        {(selectedElement.width || 100) >= REF_WIDTH ? " - Full Width" : ""}
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="2500"
                                    step="10"
                                    value={selectedElement.width || 100}
                                    onChange={(e) => updateSelected({ width: parseInt(e.target.value, 10) })}
                                    className="w-full accent-primary"
                                />
                                <div className="flex items-center gap-1.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => updateSelected({ x: 0, width: REF_WIDTH })}
                                        className="text-[11px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
                                    >
                                        100% Full Width
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-600 flex items-center justify-between">
                                    <span>Height:</span>
                                    <span className="font-mono text-primary font-bold">{selectedElement.height || 40}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="2"
                                    max="600"
                                    step="5"
                                    value={selectedElement.height || 40}
                                    onChange={(e) => updateSelected({ height: parseInt(e.target.value, 10) })}
                                    className="w-full accent-primary"
                                />
                                <div className="flex items-center gap-1.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => updateSelected({ y: 0, height: refHeight })}
                                        className="text-[11px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
                                    >
                                        Fit Height (200px)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Element Properties */}
                    {selectedElement.type === "image" && (
                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-600 flex items-center justify-between">
                                        <span>Width:</span>
                                        <span className="font-mono text-primary font-bold">
                                            {selectedElement.width || 300}px ({Math.round(((selectedElement.width || 300) / REF_WIDTH) * 100)}%)
                                            {(selectedElement.width || 300) >= REF_WIDTH ? " - Full Width" : ""}
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="40"
                                        max="2500"
                                        step="10"
                                        value={selectedElement.width || 300}
                                        onChange={(e) => updateSelected({ width: parseInt(e.target.value, 10) })}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => updateSelected({ x: 0, width: REF_WIDTH })}
                                            className="text-[11px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
                                        >
                                            100% Full Width
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateSelected({ width: Math.round(REF_WIDTH / 2) })}
                                            className="text-[11px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
                                        >
                                            50% Half
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-600 flex items-center justify-between">
                                        <span>Height:</span>
                                        <span className="font-mono text-primary font-bold">
                                            {selectedElement.height || 200}px
                                            {(selectedElement.height || 200) === refHeight ? " - Fit Banner" : ""}
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="20"
                                        max="1200"
                                        step="10"
                                        value={selectedElement.height || 200}
                                        onChange={(e) => updateSelected({ height: parseInt(e.target.value, 10) })}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => updateSelected({ y: 0, height: refHeight })}
                                            className="text-[11px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
                                        >
                                            Fit Height (200px)
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-600">Image Fit / Zoom Mode:</label>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => updateSelected({ objectFit: "cover" })}
                                            className={`flex-1 py-1 rounded text-xs font-semibold border transition-all ${
                                                (selectedElement.objectFit || "cover") === "cover"
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-white hover:bg-slate-100"
                                            }`}
                                        >
                                            Cover (Zoom / Fill)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateSelected({ objectFit: "contain" })}
                                            className={`flex-1 py-1 rounded text-xs font-semibold border transition-all ${
                                                selectedElement.objectFit === "contain"
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-white hover:bg-slate-100"
                                            }`}
                                        >
                                            Contain (Fit Full Image)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* One-click Zoom & Fit Presets */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                                <span className="font-semibold text-slate-600">Quick Zoom Controls:</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleFullWidth}
                                    className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50 font-semibold"
                                >
                                    Fill Entire Banner (100% x 200px)
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleFitHeight}
                                    className="h-7 text-xs text-sky-600 border-sky-300 hover:bg-sky-50"
                                >
                                    Fit Height (200px)
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCenterElement}
                                    className="h-7 text-xs"
                                >
                                    Center on Canvas
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuickScale(1.25)}
                                    className="h-7 text-xs gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Zoom In (+25%)
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuickScale(0.8)}
                                    className="h-7 text-xs gap-1"
                                >
                                    <Minus className="h-3 w-3" /> Zoom Out (-20%)
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

