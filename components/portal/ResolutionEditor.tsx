'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
    updateResolutionContent, 
    submitResolution, 
    softDeleteResolution,
    type Resolution,
    type Clause 
} from '@/lib/actions/resolutions';
import { useRouter } from 'next/navigation';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ---- Sortable Item Component ----
function SortableClause({ 
    clause, 
    index, 
    onDelete, 
    onUpdate 
}: { 
    clause: Clause; 
    index: number;
    onDelete: () => void;
    onUpdate: (text: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: clause.position });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`group relative bg-white/5 border border-white/10 rounded-lg p-4 mb-2 transition-all ${isDragging ? 'shadow-2xl scale-[1.02] border-[#c9a84c]/50' : ''}`}
        >
            <div className="flex gap-4 items-start">
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners}
                    className="mt-1 cursor-grab active:cursor-grabbing text-white/10 group-hover:text-white/30 transition-colors"
                >
                    <svg width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="currentColor">
                        <circle cx="3" cy="3" r="1.5" fill="currentColor"/>
                        <circle cx="3" cy="9" r="1.5" fill="currentColor"/>
                        <circle cx="3" cy="15" r="1.5" fill="currentColor"/>
                        <circle cx="9" cy="3" r="1.5" fill="currentColor"/>
                        <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                        <circle cx="9" cy="15" r="1.5" fill="currentColor"/>
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                            {clause.type} clause {index + 1}
                        </span>
                    </div>
                    <textarea
                        value={clause.text}
                        onChange={(e) => onUpdate(e.target.value)}
                        rows={2}
                        className="w-full bg-transparent border-none p-0 text-sm text-white placeholder-white/10 focus:ring-0 resize-none font-mono leading-relaxed italic"
                        placeholder="Type clause text..."
                    />
                </div>

                <button 
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ---- Main Editor Component ----
export default function ResolutionEditor({ 
    initialResolution, 
    profile,
    committee,
    topic
}: { 
    initialResolution: Resolution;
    profile: any;
    committee: any;
    topic: string;
}) {
    const [resolution, setResolution] = useState(initialResolution);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Auto-save logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (JSON.stringify(resolution.content_json) !== JSON.stringify(initialResolution.content_json)) {
                handleSave();
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [resolution.content_json]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateResolutionContent({
                id: resolution.id,
                content_json: resolution.content_json,
                last_known_updated_at: resolution.updated_at
            });
            
            if (res.conflict) {
                if (confirm('Another EB member has updated this resolution. Would you like to reload?')) {
                    router.refresh();
                }
            } else {
                setLastSaved(new Date());
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddClause = (type: 'preamble' | 'operative') => {
        const clauses = resolution.content_json[type];
        const nextPos = clauses.length > 0 ? Math.max(...clauses.map(c => c.position)) + 1.0 : 1.0;
        
        const newClause: Clause = {
            position: nextPos,
            text: '',
            type
        };

        setResolution({
            ...resolution,
            content_json: {
                ...resolution.content_json,
                [type]: [...clauses, newClause]
            }
        });
    };

    const handleUpdateClause = (type: 'preamble' | 'operative', position: number, text: string) => {
        const clauses = [...resolution.content_json[type]];
        const idx = clauses.findIndex(c => c.position === position);
        if (idx !== -1) {
            clauses[idx].text = text;
            setResolution({
                ...resolution,
                content_json: {
                    ...resolution.content_json,
                    [type]: clauses
                }
            });
        }
    };

    const handleDeleteClause = (type: 'preamble' | 'operative', position: number) => {
        setResolution({
            ...resolution,
            content_json: {
                ...resolution.content_json,
                [type]: resolution.content_json[type].filter(c => c.position !== position)
            }
        });
    };

    const handleDragEnd = (event: DragEndEvent, type: 'preamble' | 'operative') => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const clauses = resolution.content_json[type];
            const oldIndex = clauses.findIndex(c => c.position === active.id);
            const newIndex = clauses.findIndex(c => c.position === over?.id);
            
            const newOrder = arrayMove(clauses, oldIndex, newIndex);
            
            // Re-assign positions for simplicity after reorder (or use mid-points for true fractional)
            // Here we just re-assign 1.0, 2.0, etc. to keep it clean.
            const updatedOrder = newOrder.map((c, i) => ({ ...c, position: i + 1.0 }));

            setResolution({
                ...resolution,
                content_json: {
                    ...resolution.content_json,
                    [type]: updatedOrder
                }
            });
        }
    };

    const handleSubmit = async () => {
        if (!confirm('Are you sure? This will move the resolution to the floor for public viewing and amendments.')) return;
        
        startTransition(async () => {
            try {
                await submitResolution(resolution.id);
                router.push('/portal/eb');
                router.refresh();
            } catch (err: any) {
                alert(err.message);
            }
        });
    };

    const handleDelete = async () => {
        if (!confirm('Delete this draft? This cannot be undone.')) return;
        
        startTransition(async () => {
            try {
                await softDeleteResolution(resolution.id);
                router.push('/portal/eb');
                router.refresh();
            } catch (err: any) {
                alert(err.message);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Editor */}
            <div className="lg:col-span-3 space-y-10">
                {/* Resolution Info */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{resolution.blocs?.bloc_name}</h1>
                    <p className="text-white/40 font-mono text-sm uppercase tracking-widest">{topic}</p>
                    <div className="flex flex-wrap gap-2 mt-6">
                        {resolution.blocs?.member_countries?.map(c => (
                            <span key={c} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/30 uppercase tracking-wider">
                                {c}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Preamble Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-mono text-[#c9a84c] tracking-[0.2em] uppercase">Preambulatory Clauses</h2>
                        <button 
                            onClick={() => handleAddClause('preamble')}
                            className="text-[10px] font-mono text-white/30 hover:text-white transition-colors"
                        >
                            + ADD CLAUSE
                        </button>
                    </div>
                    
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(e, 'preamble')}
                    >
                        <SortableContext 
                            items={resolution.content_json.preamble.map(c => c.position)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {resolution.content_json.preamble.map((c, i) => (
                                    <SortableClause 
                                        key={c.position} 
                                        clause={c} 
                                        index={i} 
                                        onDelete={() => handleDeleteClause('preamble', c.position)}
                                        onUpdate={(text) => handleUpdateClause('preamble', c.position, text)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    {resolution.content_json.preamble.length === 0 && (
                        <div className="py-10 text-center border border-dashed border-white/5 rounded-lg text-white/10 text-xs font-mono">
                            No preambulatory clauses.
                        </div>
                    )}
                </section>

                {/* Operative Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-mono text-[#c9a84c] tracking-[0.2em] uppercase">Operative Clauses</h2>
                        <button 
                            onClick={() => handleAddClause('operative')}
                            className="text-[10px] font-mono text-white/30 hover:text-white transition-colors"
                        >
                            + ADD CLAUSE
                        </button>
                    </div>
                    
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(e, 'operative')}
                    >
                        <SortableContext 
                            items={resolution.content_json.operative.map(c => c.position)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {resolution.content_json.operative.map((c, i) => (
                                    <SortableClause 
                                        key={c.position} 
                                        clause={c} 
                                        index={i} 
                                        onDelete={() => handleDeleteClause('operative', c.position)}
                                        onUpdate={(text) => handleUpdateClause('operative', c.position, text)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    {resolution.content_json.operative.length === 0 && (
                        <div className="py-10 text-center border border-dashed border-white/5 rounded-lg text-white/10 text-xs font-mono">
                            No operative clauses.
                        </div>
                    )}
                </section>
            </div>

            {/* Right: Actions/Sidebar */}
            <div className="space-y-6">
                <div className="sticky top-24 space-y-6">
                    {/* Status & Save */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                {isSaving ? 'Saving Changes...' : lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Ready to Edit'}
                            </span>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isPending || isSaving}
                            className="w-full py-3 bg-[#c9a84c] hover:bg-[#d4b560] text-[#0a0a0f] font-bold text-xs font-mono rounded transition-all mb-3 shadow-lg shadow-[#c9a84c]/10"
                        >
                            MOVE TO FLOOR
                        </button>
                        <p className="text-[10px] text-white/20 font-mono text-center mb-6">
                            Makes resolution public and allows amendments.
                        </p>

                        <div className="h-px bg-white/5 mb-6" />

                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="w-full py-2.5 text-xs font-mono text-red-400/40 hover:text-red-400 hover:bg-red-400/5 border border-red-400/10 rounded transition-all"
                        >
                            DELETE DRAFT
                        </button>
                    </div>

                    {/* Editor Tips */}
                    <div className="p-6 border border-white/5 rounded-xl bg-white/[0.01]">
                        <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">EB Editor Tips</h3>
                        <ul className="space-y-4 text-[11px] text-white/20 font-mono leading-relaxed">
                            <li>• Drag the dots ⠿ to reorder clauses instantly.</li>
                            <li>• Changes are saved automatically every 2 seconds.</li>
                            <li>• Do not include "The Committee," or clause numbers; formatting is applied automatically on the floor.</li>
                            <li>• Ensure preamble clauses end with a comma (,) and operative with a semicolon (;).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
