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
    board?: string; // "ICSE" | "IGCSE"
    slots?: string[];
    chapters: Chapter[];
};

// Default slots shown by default (also dynamic)
const DEFAULT_SLOTS = ["NOTES", "TEST_PAPER"];

const PRESET_SLOT_SUGGESTIONS = [
    { label: "Solutions", value: "SOLUTION" },
    { label: "Question Bank", value: "QUESTION_BANK" },
    { label: "Worksheet", value: "WORKSHEET" },
    { label: "Sample Paper", value: "SAMPLE_PAPER" },
    { label: "Revision Notes", value: "REVISION_NOTES" },
    { label: "Mind Map", value: "MIND_MAP" },
];

export default function ContentManagerClient({ initialSubjects }: { initialSubjects: Subject[] }) {
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [selectedBoard, setSelectedBoard] = useState<"ICSE" | "IGCSE">("ICSE");
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState("");
    const [newSubjectClass, setNewSubjectClass] = useState(9);

    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
    const [editingPdfId, setEditingPdfId] = useState<string | null>(null);

    // State for Subject-wide slot templates
    const [addingSubjectSlotId, setAddingSubjectSlotId] = useState<string | null>(null);
    const [newSubjectSlotInput, setNewSubjectSlotInput] = useState<string>("");

    // State for dynamic slots per chapter
    const [customSlots, setCustomSlots] = useState<Record<string, string[]>>({});
    const [removedSlots, setRemovedSlots] = useState<Record<string, string[]>>({});
    const [newSlotChapterId, setNewSlotChapterId] = useState<string | null>(null);
    const [newSlotInput, setNewSlotInput] = useState<string>("");

    // State for loading
    const [isLoading, setIsLoading] = useState<string | null>(null); // holds the id of what is loading

    const formatSlotLabel = (type: string) => {
        if (!type) return "";
        return type
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    const getChapterSlots = (chapter: Chapter, subject: Subject) => {
        // 1. Base slots from the subject (fall back to DEFAULT_SLOTS)
        const baseSubjectSlots = subject.slots && subject.slots.length > 0 ? subject.slots : DEFAULT_SLOTS;
        // 2. Existing uploaded types in this chapter
        const existingTypes = chapter.contents.map(c => c.type);
        // 3. Chapter-specific added slots
        const added = customSlots[chapter.id] || [];
        // 4. Chapter-specific removed slots
        const removed = removedSlots[chapter.id] || [];

        // Defaults + any existing uploaded types + any added by admin
        const all = Array.from(new Set([...baseSubjectSlots, ...existingTypes, ...added]));

        // Exclude removed slots ONLY if there is no uploaded content in that slot
        return all.filter(slot => !removed.includes(slot) || existingTypes.includes(slot));
    };

    // Handlers for Subject-wide Slots
    const handleAddSubjectSlot = async (subjectId: string, slotValue?: string) => {
        const val = (slotValue || newSubjectSlotInput).trim();
        if (!val) return;
        const normalized = val.toUpperCase().replace(/\s+/g, "_");

        const targetSubject = subjects.find(s => s.id === subjectId);
        if (!targetSubject) return;

        const currentSlots = targetSubject.slots && targetSubject.slots.length > 0 ? targetSubject.slots : DEFAULT_SLOTS;
        if (currentSlots.includes(normalized)) {
            alert(`The "${formatSlotLabel(normalized)}" slot is already active for this subject.`);
            return;
        }

        const updatedSlots = [...currentSlots, normalized];

        setIsLoading(`subject-slot-${subjectId}`);
        try {
            const res = await fetch("/api/admin/subjects/slots", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subjectId, slots: updatedSlots })
            });
            if (res.ok) {
                setSubjects(subs => subs.map(s => s.id === subjectId ? { ...s, slots: updatedSlots } : s));
                setNewSubjectSlotInput("");
                setAddingSubjectSlotId(null);
            } else {
                alert("Failed to update subject slots");
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleRemoveSubjectSlot = async (subjectId: string, slotType: string) => {
        const targetSubject = subjects.find(s => s.id === subjectId);
        if (!targetSubject) return;

        const currentSlots = targetSubject.slots && targetSubject.slots.length > 0 ? targetSubject.slots : DEFAULT_SLOTS;
        const updatedSlots = currentSlots.filter(s => s !== slotType);

        if (updatedSlots.length === 0) {
            alert("A subject must have at least one slot.");
            return;
        }

        if (!confirm(`Remove the "${formatSlotLabel(slotType)}" slot from all chapters in Class ${targetSubject.class} ${targetSubject.name}? Any uploaded PDFs in chapters will remain safe.`)) {
            return;
        }

        setIsLoading(`subject-slot-${subjectId}`);
        try {
            const res = await fetch("/api/admin/subjects/slots", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subjectId, slots: updatedSlots })
            });
            if (res.ok) {
                setSubjects(subs => subs.map(s => s.id === subjectId ? { ...s, slots: updatedSlots } : s));
            } else {
                alert("Failed to update subject slots");
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleAddSlot = (chapterId: string, slotValue?: string) => {
        const val = (slotValue || newSlotInput).trim();
        if (!val) return;
        const normalized = val.toUpperCase().replace(/\s+/g, "_");

        setCustomSlots(prev => ({
            ...prev,
            [chapterId]: Array.from(new Set([...(prev[chapterId] || []), normalized]))
        }));

        setRemovedSlots(prev => ({
            ...prev,
            [chapterId]: (prev[chapterId] || []).filter(s => s !== normalized)
        }));

        setNewSlotInput("");
        setNewSlotChapterId(null);
    };

    const handleRemoveSlot = (chapterId: string, type: string) => {
        setCustomSlots(prev => ({
            ...prev,
            [chapterId]: (prev[chapterId] || []).filter(s => s !== type)
        }));
        setRemovedSlots(prev => ({
            ...prev,
            [chapterId]: Array.from(new Set([...(prev[chapterId] || []), type]))
        }));
    };

    // Handlers for Subject Management
    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newSubjectName.trim();
        if (!trimmed) return;

        setIsLoading(`create-subject-${selectedBoard}`);
        try {
            const res = await fetch("/api/admin/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimmed,
                    class: Number(newSubjectClass),
                    board: selectedBoard
                })
            });
            if (res.ok) {
                const newSubject = await res.json();
                setSubjects(prev => [...prev, newSubject]);
                setNewSubjectName("");
                setIsAddingSubject(false);
            } else {
                alert("Failed to create subject");
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
        if (!confirm(`Are you sure you want to delete "${subjectName}" and all its chapters/materials? This cannot be undone.`)) {
            return;
        }

        setIsLoading(`delete-subject-${subjectId}`);
        try {
            const res = await fetch(`/api/admin/subjects?id=${subjectId}`, { method: "DELETE" });
            if (res.ok) {
                setSubjects(prev => prev.filter(s => s.id !== subjectId));
            } else {
                alert("Failed to delete subject");
            }
        } finally {
            setIsLoading(null);
        }
    };

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

    const filteredSubjects = subjects.filter(
        s => (s.board || "ICSE").toUpperCase() === selectedBoard
    );
    const icseCount = subjects.filter(s => (s.board || "ICSE").toUpperCase() === "ICSE").length;
    const igcseCount = subjects.filter(s => (s.board || "ICSE").toUpperCase() === "IGCSE").length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
            {/* Header with Board Switcher */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h2 className="text-xl font-bold">Content Management</h2>
                    {/* Board Selector Tabs */}
                    <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                        <button
                            type="button"
                            onClick={() => { setSelectedBoard("ICSE"); setIsAddingSubject(false); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                selectedBoard === "ICSE"
                                    ? "bg-white text-primary shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            ICSE ({icseCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSelectedBoard("IGCSE"); setIsAddingSubject(false); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                selectedBoard === "IGCSE"
                                    ? "bg-white text-primary shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            IGCSE ({igcseCount})
                        </button>
                    </div>
                </div>

                <Button
                    size="sm"
                    className="font-medium text-xs h-9 bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setIsAddingSubject(!isAddingSubject)}
                >
                    <Plus className="h-4 w-4 mr-1.5" /> Add New {selectedBoard} Subject
                </Button>
            </div>

            {/* New Subject Form (when toggled open) */}
            {isAddingSubject && (
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <form onSubmit={handleCreateSubject} className="max-w-2xl bg-white p-4 rounded-lg border border-primary/20 shadow-xs space-y-3">
                        <h4 className="text-sm font-bold text-slate-800">
                            Create New {selectedBoard} Subject
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    placeholder="e.g. Physics, Chemistry, Biology, Mathematics"
                                    className="w-full text-sm border-slate-300 rounded p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Class / Grade</label>
                                <select
                                    value={newSubjectClass}
                                    onChange={(e) => setNewSubjectClass(Number(e.target.value))}
                                    className="w-full text-sm border-slate-300 rounded p-2 border bg-white"
                                >
                                    <option value={9}>Class 9 / Grade 9</option>
                                    <option value={10}>Class 10 / Grade 10</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <Button type="submit" size="sm" disabled={isLoading === `create-subject-${selectedBoard}`}>
                                {isLoading === `create-subject-${selectedBoard}` ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                                Save Subject
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingSubject(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Subjects List */}
            <div className="divide-y divide-slate-100">
                {filteredSubjects.length === 0 ? (
                    <div className="py-16 text-center px-4 bg-slate-50/50">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <Plus className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">No {selectedBoard} Subjects Yet</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
                            You haven&apos;t added any subjects for the {selectedBoard} curriculum yet. Click the button below to add your first subject.
                        </p>
                        <Button size="sm" onClick={() => setIsAddingSubject(true)}>
                            <Plus className="h-4 w-4 mr-1.5" /> Add First {selectedBoard} Subject
                        </Button>
                    </div>
                ) : (
                    filteredSubjects.map((subject) => (
                        <div key={subject.id} className="block">
                            <div 
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedSubject === subject.id ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                                                {subject.board || "ICSE"}
                                            </span>
                                            <h3 className="font-semibold text-lg">Class {subject.class} {subject.name}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{subject.chapters.length} Chapters</span>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-8 w-8 p-0 text-red-500 bg-transparent hover:bg-red-50 border-none"
                                        title={`Delete ${subject.name} subject`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSubject(subject.id, `Class ${subject.class} ${subject.name}`);
                                        }}
                                    >
                                        {isLoading === `delete-subject-${subject.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            
                            {expandedSubject === subject.id && (
                            <div className="bg-slate-50 pl-6 sm:pl-12 pr-4 py-4 space-y-3 border-t border-slate-100">
                                {/* Subject-wide Slots Template Manager */}
                                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs mb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                                                Standard Material Slots for Class {subject.class} {subject.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Slots defined here automatically appear across all {subject.chapters.length} chapters so you don&apos;t have to add them one by one.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs h-8 border-primary/40 text-primary hover:bg-primary hover:text-white"
                                            onClick={() => {
                                                setAddingSubjectSlotId(addingSubjectSlotId === subject.id ? null : subject.id);
                                                setNewSubjectSlotInput("");
                                            }}
                                        >
                                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Slot to All Chapters
                                        </Button>
                                    </div>

                                    {/* Current Subject Slots Badges */}
                                    <div className="flex flex-wrap items-center gap-2 pt-3">
                                        <span className="text-xs text-slate-400 font-medium mr-1">Active Slots:</span>
                                        {(subject.slots && subject.slots.length > 0 ? subject.slots : DEFAULT_SLOTS).map(slotType => (
                                            <span
                                                key={slotType}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200"
                                            >
                                                {formatSlotLabel(slotType)}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubjectSlot(subject.id, slotType)}
                                                    className="text-slate-400 hover:text-red-500 font-bold ml-0.5 text-xs"
                                                    title={`Remove ${formatSlotLabel(slotType)} from all chapters`}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Add Slot to Subject Form (when toggled open) */}
                                    {addingSubjectSlotId === subject.id && (
                                        <div className="mt-3 p-3 bg-slate-50 border border-primary/20 rounded-md space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-700">Select or Type Slot to Add to All {subject.chapters.length} Chapters:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setAddingSubjectSlotId(null)}
                                                    className="text-xs text-slate-400 hover:text-slate-600"
                                                >
                                                    ✕ Cancel
                                                </button>
                                            </div>
                                            {/* Presets */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {PRESET_SLOT_SUGGESTIONS.map(preset => (
                                                    <button
                                                        key={preset.value}
                                                        type="button"
                                                        onClick={() => handleAddSubjectSlot(subject.id, preset.value)}
                                                        className="text-xs px-2.5 py-1 bg-white hover:bg-primary hover:text-white rounded-full text-slate-600 transition-colors border border-slate-200 shadow-2xs"
                                                    >
                                                        + {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Custom Input */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newSubjectSlotInput}
                                                    onChange={(e) => setNewSubjectSlotInput(e.target.value)}
                                                    placeholder="Or type custom slot (e.g. Question Bank, Key Formulas)..."
                                                    className="flex-1 text-xs border-slate-300 rounded p-1.5 border bg-white"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleAddSubjectSlot(subject.id);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="text-xs h-7"
                                                    disabled={isLoading === `subject-slot-${subject.id}`}
                                                    onClick={() => handleAddSubjectSlot(subject.id)}
                                                >
                                                    {isLoading === `subject-slot-${subject.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply to All Chapters"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

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
                                            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
                                                {getChapterSlots(chapter, subject).map(type => {
                                                    const pdf = chapter.contents.find(c => c.type === type);
                                                    const label = formatSlotLabel(type);
                                                    return (
                                                        <div key={type} className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
                                                            <div className="bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 uppercase border-b border-slate-200 flex items-center justify-between">
                                                                <span>{label} Slot</span>
                                                                {!pdf && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveSlot(chapter.id, type)}
                                                                        className="text-slate-400 hover:text-red-500 text-xs font-normal transition-colors"
                                                                        title="Remove empty slot"
                                                                    >
                                                                        ✕ Remove Slot
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {pdf ? (
                                                                editingPdfId === pdf.id ? (
                                                                    <form className="p-3 bg-slate-50 flex flex-col gap-3" onSubmit={(e) => handleEditPDF(e, pdf.id, chapter.id, subject.id)}>
                                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                                            <input required type="text" name="title" defaultValue={pdf.title} className="flex-1 text-sm border-slate-300 rounded p-1.5 border" placeholder="PDF Title" />
                                                                            <div className="flex gap-2 items-center">
                                                                                <input 
                                                                                    type="text" 
                                                                                    name="type" 
                                                                                    defaultValue={pdf.type} 
                                                                                    className="w-32 text-xs border-slate-300 rounded p-1.5 border uppercase font-mono" 
                                                                                    placeholder="Slot Type" 
                                                                                    title="Slot / Category Type"
                                                                                />
                                                                                <label className="text-xs flex items-center gap-1 bg-white px-2 py-1.5 border border-slate-300 rounded cursor-pointer whitespace-nowrap">
                                                                                    <input type="checkbox" name="isFree" value="true" defaultChecked={pdf.isFree} className="h-3 w-3" />
                                                                                    Free
                                                                                </label>
                                                                            </div>
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
                                                                <form className="p-3 flex flex-col sm:flex-row items-center gap-2" onSubmit={(e) => handleUploadPDF(e, chapter.id, subject.id)}>
                                                                    <input type="hidden" name="type" value={type} />
                                                                    <input type="hidden" name="chapterId" value={chapter.id} />
                                                                    <input required type="text" name="title" className="flex-1 w-full text-sm border-slate-300 rounded p-1.5 border" placeholder={`PDF Title (e.g. ${chapter.title} ${label})`} />
                                                                    <input required type="file" name="file" accept="application/pdf" className="w-full sm:w-48 text-xs p-1 border border-slate-300 rounded" />
                                                                    <label className="text-xs flex items-center gap-1 whitespace-nowrap">
                                                                        <input type="checkbox" name="isFree" value="true" className="h-3 w-3" />
                                                                        Free
                                                                    </label>
                                                                    <Button type="submit" size="sm" className="whitespace-nowrap w-full sm:w-auto" disabled={isLoading === `upload-${chapter.id}-${type}`}>
                                                                        {isLoading === `upload-${chapter.id}-${type}` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                                                                    </Button>
                                                                </form>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Add New Slot Section */}
                                                {newSlotChapterId === chapter.id ? (
                                                    <div className="p-3 bg-white border border-dashed border-primary/40 rounded-lg shadow-xs space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-semibold text-slate-700">Add a New Material Slot:</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => { setNewSlotChapterId(null); setNewSlotInput(""); }}
                                                                className="text-xs text-slate-400 hover:text-slate-600"
                                                            >
                                                                ✕ Cancel
                                                            </button>
                                                        </div>
                                                        {/* Quick Preset Pills */}
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {PRESET_SLOT_SUGGESTIONS.map(preset => (
                                                                <button
                                                                    key={preset.value}
                                                                    type="button"
                                                                    onClick={() => handleAddSlot(chapter.id, preset.value)}
                                                                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-primary hover:text-white rounded-full text-slate-600 transition-colors border border-slate-200"
                                                                >
                                                                    + {preset.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {/* Custom Slot Input */}
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={newSlotInput}
                                                                onChange={(e) => setNewSlotInput(e.target.value)}
                                                                placeholder="Or type custom slot name (e.g. Formula Sheet, Assignment)..."
                                                                className="flex-1 text-sm border-slate-300 rounded p-1.5 border"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        handleAddSlot(chapter.id);
                                                                    }
                                                                }}
                                                            />
                                                            <Button type="button" size="sm" onClick={() => handleAddSlot(chapter.id)}>
                                                                Add Slot
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full border-dashed text-slate-600 hover:text-primary hover:border-primary"
                                                        onClick={() => { setNewSlotChapterId(chapter.id); setNewSlotInput(""); }}
                                                    >
                                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Another Material Slot (Solutions, Worksheet, etc.)
                                                    </Button>
                                                )}
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
                ))
            )}
        </div>
    </div>
);
}
