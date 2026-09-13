"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Upload, Trash2, Edit2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Content = {
    id: string;
    title: string;
    type: string;
    fileUrl: string;
    isFree: boolean;
};

type Chapter = {
    id: string;
    title: string;
    contents: Content[];
};

type Subject = {
    id: string;
    name: string;
    class: number;
    chapters: Chapter[];
};

export default function ContentManagerClient({ initialSubjects }: { initialSubjects: Subject[] }) {
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
    const [editingPdfId, setEditingPdfId] = useState<string | null>(null);

    // State for loading
    const [isLoading, setIsLoading] = useState<string | null>(null); // holds the id of what is loading

    // Handlers for Chapter
    const handleAddChapter = async (subjectId: string) => {
        const title = prompt("Enter new chapter title:");
        if (!title) return;
        setIsLoading(`add-chap-${subjectId}`);
        try {
            const res = await fetch("/api/admin/chapters", {
                method: "POST",
                body: JSON.stringify({ title, subjectId, order: subjects.find(s => s.id === subjectId)?.chapters.length || 0 })
            });
            if (res.ok) {
                const newChap = await res.json();
                setSubjects(subs => subs.map(s => s.id === subjectId ? { ...s, chapters: [...s.chapters, { ...newChap, contents: [] }] } : s));
            } else {
                alert("Failed to add chapter");
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleRenameChapter = async (chapterId: string, currentTitle: string, subjectId: string) => {
        const title = prompt("Rename chapter title:", currentTitle);
        if (!title || title === currentTitle) return;
        setIsLoading(`edit-chap-${chapterId}`);
        try {
            const res = await fetch("/api/admin/chapters", {
                method: "PUT",
                body: JSON.stringify({ id: chapterId, title })
            });
            if (res.ok) {
                setSubjects(subs => subs.map(s => s.id === subjectId ? {
                    ...s, chapters: s.chapters.map(c => c.id === chapterId ? { ...c, title } : c)
                } : s));
            } else {
                alert("Failed to rename chapter");
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleDeleteChapter = async (chapterId: string, subjectId: string) => {
        if (!confirm("Are you sure you want to delete this chapter and all its PDFs?")) return;
        setIsLoading(`delete-chap-${chapterId}`);
        try {
            const res = await fetch(`/api/admin/chapters?id=${chapterId}`, { method: "DELETE" });
            if (res.ok) {
                setSubjects(subs => subs.map(s => s.id === subjectId ? {
                    ...s, chapters: s.chapters.filter(c => c.id !== chapterId)
                } : s));
            } else {
                alert("Failed to delete chapter");
            }
        } finally {
            setIsLoading(null);
        }
    };

    // Handlers for PDF Upload/Management
    const handleUploadPDF = async (e: React.FormEvent<HTMLFormElement>, chapterId: string, subjectId: string) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = formData.get("type") as string;
        setIsLoading(`upload-${chapterId}-${type}`);
        try {
            const res = await fetch("/api/admin/content/upload", {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                const newContent = await res.json();
                setSubjects(subs => subs.map(s => s.id === subjectId ? {
                    ...s, chapters: s.chapters.map(c => c.id === chapterId ? { ...c, contents: [...c.contents, newContent] } : c)
                } : s));
                (e.target as HTMLFormElement).reset();
            } else {
                alert("Failed to upload PDF");
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleEditPDF = async (e: React.FormEvent<HTMLFormElement>, contentId: string, chapterId: string, subjectId: string) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("contentId", contentId);
        formData.append("chapterId", chapterId);

        setIsLoading(`edit-pdf-${contentId}`);
        try {
            const res = await fetch("/api/admin/content/upload", {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                const updatedContent = await res.json();
                setSubjects(subs => subs.map(s => s.id === subjectId ? {
                    ...s, chapters: s.chapters.map(c => c.id === chapterId ? {
                        ...c, contents: c.contents.map(pdf => pdf.id === contentId ? updatedContent : pdf)
                    } : c)
                } : s));
                setEditingPdfId(null);
            } else {
                alert("Failed to edit PDF");
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleDeletePDF = async (contentId: string, chapterId: string, subjectId: string) => {
        if (!confirm("Delete this PDF?")) return;
        setIsLoading(`delete-pdf-${contentId}`);
        try {
            const res = await fetch(`/api/admin/content?id=${contentId}`, { method: "DELETE" });
            if (res.ok) {
                setSubjects(subs => subs.map(s => s.id === subjectId ? {
                    ...s, chapters: s.chapters.map(c => c.id === chapterId ? {
                        ...c, contents: c.contents.filter(pdf => pdf.id !== contentId)
                    } : c)
                } : s));
            } else {
                alert("Failed to delete PDF");
            }
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">Content Management ({subjects.length} Subjects)</h2>
            </div>
            <div className="divide-y divide-slate-100">
                {subjects.map((subject) => (
                    <div key={subject.id} className="block">
                        <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                        >
                            <div className="flex items-center gap-3">
                                {expandedSubject === subject.id ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                                <h3 className="font-semibold text-lg">Class {subject.class} {subject.name}</h3>
                            </div>
                            <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{subject.chapters.length} Chapters</span>
                        </div>
                        
                        {expandedSubject === subject.id && (
                            <div className="bg-slate-50 pl-12 pr-4 py-4 space-y-3 border-t border-slate-100">
                                {subject.chapters.map((chapter) => (
                                    <div key={chapter.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                        <div 
                                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                            onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {expandedChapter === chapter.id ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                                                <span className="font-medium text-slate-800">{chapter.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 mr-2">{chapter.contents.length} PDFs</span>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleRenameChapter(chapter.id, chapter.title, subject.id); }}>
                                                    {isLoading === `edit-chap-${chapter.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                                                </Button>
                                                <Button size="sm" variant="destructive" className="h-8 w-8 p-0 bg-red-50 text-red-600 hover:bg-red-100 border-none" onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id, subject.id); }}>
                                                    {isLoading === `delete-chap-${chapter.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        {expandedChapter === chapter.id && (
                                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                                {(["NOTES", "TEST_PAPER"] as const).map(type => {
                                                    const pdf = chapter.contents.find(c => c.type === type);
                                                    const label = type === "NOTES" ? "Notes" : "Test Paper";
                                                    return (
                                                        <div key={type} className="bg-white rounded border border-slate-200 overflow-hidden mb-4">
                                                            <div className="bg-slate-100 p-2 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                                                                {label} Slot
                                                            </div>
                                                            {pdf ? (
                                                                editingPdfId === pdf.id ? (
                                                                    <form className="p-3 bg-slate-50 flex flex-col gap-3" onSubmit={(e) => handleEditPDF(e, pdf.id, chapter.id, subject.id)}>
                                                                        <div className="flex gap-2">
                                                                            <input required type="text" name="title" defaultValue={pdf.title} className="flex-1 text-sm border-slate-300 rounded p-1.5 border" placeholder="PDF Title" />
                                                                            <input type="hidden" name="type" value={type} />
                                                                            <label className="text-xs flex items-center gap-1 bg-white px-2 border border-slate-300 rounded">
                                                                                <input type="checkbox" name="isFree" value="true" defaultChecked={pdf.isFree} className="h-3 w-3" />
                                                                                Free
                                                                            </label>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <input type="file" name="file" accept="application/pdf" className="flex-1 text-xs p-1 border border-slate-300 rounded bg-white" />
                                                                            <Button type="submit" size="sm" disabled={isLoading === `edit-pdf-${pdf.id}`}>
                                                                                {isLoading === `edit-pdf-${pdf.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                                                            </Button>
                                                                            <Button type="button" size="sm" variant="ghost" onClick={() => setEditingPdfId(null)}>Cancel</Button>
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-500">* Leave file empty to keep current PDF</p>
                                                                    </form>
                                                                ) : (
                                                                    <div className="flex items-center justify-between p-3">
                                                                        <div>
                                                                            <p className="font-medium text-sm text-slate-800">
                                                                                {pdf.title} 
                                                                                {pdf.isFree && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-bold">Free</span>}
                                                                            </p>
                                                                            <a href={pdf.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-xs">{pdf.fileUrl}</a>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setEditingPdfId(pdf.id)}>
                                                                                <Edit2 className="h-4 w-4 text-slate-600" />
                                                                            </Button>
                                                                            <Button size="sm" variant="destructive" className="h-8 w-8 p-0 text-red-500 bg-transparent hover:bg-red-50 border-none" onClick={() => handleDeletePDF(pdf.id, chapter.id, subject.id)}>
                                                                                {isLoading === `delete-pdf-${pdf.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <form className="p-3 flex items-center gap-2" onSubmit={(e) => handleUploadPDF(e, chapter.id, subject.id)}>
                                                                    <input type="hidden" name="type" value={type} />
                                                                    <input type="hidden" name="chapterId" value={chapter.id} />
                                                                    <input required type="text" name="title" className="flex-1 text-sm border-slate-300 rounded p-1.5 border" placeholder="PDF Title" />
                                                                    <input required type="file" name="file" accept="application/pdf" className="w-48 text-xs p-1 border border-slate-300 rounded" />
                                                                    <label className="text-xs flex items-center gap-1">
                                                                        <input type="checkbox" name="isFree" value="true" className="h-3 w-3" />
                                                                        Free
                                                                    </label>
                                                                    <Button type="submit" size="sm" disabled={isLoading === `upload-${chapter.id}-${type}`}>
                                                                        {isLoading === `upload-${chapter.id}-${type}` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                                                                    </Button>
                                                                </form>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full mt-2 border-dashed" onClick={() => handleAddChapter(subject.id)}>
                                    <Plus className="h-4 w-4 mr-2" /> Add New Chapter
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
