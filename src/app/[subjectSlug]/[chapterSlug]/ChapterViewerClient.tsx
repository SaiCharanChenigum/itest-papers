"use client";

import { useState } from "react";
import { Lock, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NavButton } from "@/components/ui/NavButton";

interface ContentItem {
    id: string;
    title: string;
    type: string;
    fileUrl: string;
    isFree: boolean;
    exists: boolean;
}

interface ChapterViewerClientProps {
    contents: ContentItem[];
    hasPremiumAccess: boolean;
}

export default function ChapterViewerClient({ contents, hasPremiumAccess }: ChapterViewerClientProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeItem = contents[activeIndex];

    if (!activeItem) return null;

    const canAccessItem = hasPremiumAccess || activeItem.isFree;

    const displayUrl = activeItem.fileUrl;

    return (
        <div className="flex flex-col gap-6">
            {/* Tabs for switching between Notes, Test Paper, Solutions */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                {contents.map((item, index) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveIndex(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${activeIndex === index
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card text-foreground/80 hover:bg-accent hover:text-foreground border-border"
                            }`}
                    >
                        {item.type.replace('_', ' ')}
                        {(!hasPremiumAccess && !item.isFree) && <Lock className="inline-block w-3 h-3 ml-1.5 opacity-70" />}
                    </button>
                ))}
            </div>

            {/* Viewer Section */}
            <div className="card-academic overflow-hidden p-0 border-0 shadow-lg relative rounded-xl">
                <div className="bg-slate-50 border-b border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        {canAccessItem ? <FileText className="h-5 w-5 text-primary shrink-0" /> : <Lock className="h-5 w-5 text-muted-foreground shrink-0" />}
                        <h2 className="font-bold text-lg">{activeItem.title}</h2>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${canAccessItem ? (activeItem.isFree ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary') : 'bg-muted text-muted-foreground'}`}>
                            {canAccessItem ? (activeItem.isFree ? 'Free Preview' : 'Unlocked') : 'Premium'}
                        </span>
                    </div>
                </div>

                {canAccessItem ? (
                    activeItem.exists ? (
                        <div className="flex flex-col">
                            <div className="w-full h-[600px] sm:h-[800px] bg-slate-200 relative border-b border-border">
                                <iframe
                                    src={`${displayUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full border-0 absolute inset-0"
                                    title={activeItem.title}
                                    allowFullScreen
                                />
                            </div>
                            <div className="bg-slate-50 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-slate-500 font-medium">View the full document above or download it for offline use.</p>
                                <Button size="default" className="w-full sm:w-auto font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" asChild>
                                    <a href={displayUrl} target="_blank" rel="noopener noreferrer" download>
                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full py-24 bg-slate-50 relative flex flex-col items-center justify-center border-t border-border/50 text-center px-4">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <FileText className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Document Unavailable</h3>
                            <p className="text-slate-500 max-w-md">
                                The PDF file for this chapter has not been uploaded to the server yet. Please check back later.
                            </p>
                        </div>
                    )
                ) : (
                    <div className="w-full h-[400px] bg-slate-50 relative flex items-center justify-center border-t border-border/50">
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-teal-100 relative z-20">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Document</h3>
                                <p className="text-sm text-slate-600 mb-6">
                                    This document is locked. Upgrade to premium to view and download this material.
                                </p>
                                <NavButton href="/pricing" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold border-0 shadow-lg shadow-orange-500/20">
                                    Unlock Full Access
                                </NavButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
