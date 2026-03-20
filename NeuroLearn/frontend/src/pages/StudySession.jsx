import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Circle, Clock, BookOpen, Send, Loader2, Sparkles, Target, Activity, ArrowRight } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import MeshBackground from '../components/MeshBackground';

const StudySession = () => {
    const { id: sessionId } = useParams();
    const [searchParams] = useSearchParams();
    const subId = searchParams.get('sub_id');
    const planId = searchParams.get('plan_id');
    const [tasks, setTasks] = useState([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ level: 'clear', note: '' });
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();

    const handleExit = () => {
        if (planId) {
            navigate(`/plan/${planId}`);
        } else {
            navigate('/');
        }
    };

    const fetchSessionDetails = async () => {
        try {
            const res = await api.get(`study-plan/sessions/${sessionId}/`);
            setTasks(res.data.sub_sessions);

            // Trigger generation for any pending sub-sessions
            res.data.sub_sessions.forEach(ss => {
                if (ss.generation_status === 'pending') {
                    triggerSubSessionContent(ss.id);
                }
            });

            // Find first pending sub-session or use subId if provided
            let startIndex = 0;
            if (subId) {
                const foundIndex = res.data.sub_sessions.findIndex(s => s.id.toString() === subId);
                if (foundIndex !== -1) startIndex = foundIndex;
            }
            setCurrentTaskIndex(startIndex);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const triggerSubSessionContent = async (subSessionId) => {
        try {
            await api.post(`study-plan/sub-sessions/${subSessionId}/trigger-content/`);
        } catch (err) {
            console.error("Failed to trigger sub-session content:", err);
        }
    };

    const pollSession = async () => {
        try {
            const res = await api.get(`study-plan/sessions/${sessionId}/`);
            setTasks(res.data.sub_sessions);
        } catch (err) {
            console.error("Polling failed:", err);
        }
    };

    useEffect(() => {
        fetchSessionDetails();
    }, [sessionId, subId]);

    // Polling logic for generating sub-sessions
    useEffect(() => {
        if (tasks.length === 0) return;

        const isAnyGenerating = tasks.some(t => t.generation_status === 'generating');
        if (isAnyGenerating) {
            const interval = setInterval(pollSession, 4000);
            return () => clearInterval(interval);
        }
    }, [tasks]);

    const handleSubmitFeedback = async () => {
        setSubmitting(true);
        try {
            const currentTask = tasks[currentTaskIndex];
            await api.post(`study-plan/sub-sessions/${currentTask.id}/feedback/`, {
                understanding_level: feedback.level,
                user_note: feedback.note
            });

            // Log activity
            api.post('activity/log/', {
                action: "Task Feedback Submitted",
                details: { task_id: currentTask.id, level: feedback.level }
            }).catch(console.error);

            // Refresh tasks or move to next logic
            await fetchSessionDetails();

            const nextIdx = currentTaskIndex + 1;
            const nextSubId = nextIdx < tasks.length ? tasks[nextIdx].id : null;

            // Navigate to quiz for the just completed sub-session
            let quizUrl = `/quiz?sub_session_id=${currentTask.id}&session_id=${sessionId}`;
            if (planId) quizUrl += `&plan_id=${planId}`;
            if (nextSubId) quizUrl += `&next_sub_id=${nextSubId}`;

            navigate(quizUrl);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetryGeneration = async () => {
        // If there is no planId, we cannot hit the start endpoint, so we fallback
        const targetPlanId = planId || tasks[0]?.study_session?.plan_version?.study_plan;
        if (!targetPlanId) return;

        setSubmitting(true);
        try {
            await api.post(`study-plan/${targetPlanId}/start-session/`, {
                session_id: sessionId,
                retry_generation: true
            });
            // Refetch tasks and reset to first
            await fetchSessionDetails();
            setCurrentTaskIndex(0);
        } catch (err) {
            console.error("Failed to retry task generation:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading session...</p>
        </div>
    );

    const currentTask = tasks[currentTaskIndex];
    // Only show failure block if the status is explicitly 'failed'
    const isManualBlock = currentTask?.generation_status === 'failed';
    const progressPercent = (tasks.indexOf(currentTask) / tasks.length) * 100;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 font-primary">
            <MeshBackground />

            {/* Session Header */}
            <nav className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-2.5">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center px-6">
                    <Button variant="ghost" onClick={handleExit} icon={ChevronLeft} className="text-slate-400 text-xs px-3 py-1.5">
                        Exit Session
                    </Button>
                    <div className="text-center">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Active Session</span>
                        <h2 className="text-sm font-bold text-white tracking-tight">Today's Focus</h2>
                    </div>
                    <div className="w-24"></div> {/* Spacer */}
                </div>

                {/* Progress Bar */}
                <div className="max-w-[1600px] mx-auto mt-4 px-2">
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-indigo-500"
                        />
                    </div>
                </div>
            </nav>

            <div className="max-w-[1600px] mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Tasks List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">Knowledge Units</h3>
                    <div className="space-y-2">
                        {tasks.map((task, idx) => (
                            <button
                                key={task.id}
                                onClick={() => {
                                    setCurrentTaskIndex(idx);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-full text-left p-4 rounded-2xl transition-all border ${idx === currentTaskIndex
                                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white ring-1 ring-indigo-500/20'
                                    : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/40'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    {task.generation_status === 'generating' ? (
                                        <Loader2 size={16} className="text-indigo-400 animate-spin" />
                                    ) : (
                                        <Circle size={18} className={idx === currentTaskIndex ? "text-indigo-400" : "text-slate-600"} />
                                    )}
                                    <span className={`font-bold text-sm truncate ${task.generation_status === 'generating' ? 'opacity-50' : ''}`}>{task.title}</span>
                                </div>
                                <div className="flex items-center mt-2 pl-7 space-x-3 text-[10px] uppercase tracking-widest font-black opacity-60">
                                    <span className="flex items-center"><Clock size={10} className="mr-1" /> {task.allocated_minutes}m</span>
                                    <span className="flex items-center"><Target size={10} className="mr-1" /> Micro Unit</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content: Task Detail */}
                <div className="lg:col-span-3 space-y-8">
                    {currentTask ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTask.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card className="!p-6 lg:!p-10 border-slate-800/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Sparkles size={120} />
                                    </div>

                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                                            Sub-Session Unit
                                        </div>
                                        <div className="text-slate-500 text-xs font-bold">• {currentTask.allocated_minutes} Minute focus</div>
                                    </div>

                                    <h1 className="text-3xl font-black text-white mb-4 tracking-tight">{currentTask.title}</h1>

                                    <div className="prose prose-invert prose-indigo max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-code:text-indigo-300">
                                        {currentTask.generation_status === 'generating' ? (
                                            <div className="flex flex-col items-center justify-center py-20">
                                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                                                    Synthesizing deep knowledge...
                                                </p>
                                            </div>
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {currentTask.content?.content_md || "No content generated for this unit."}
                                            </ReactMarkdown>
                                        )}
                                    </div>

                                    {/* Content generation failure block remains inside explanation card if needed, 
                                            but since we're separating the evaluation, we close the card here. */}
                                    {isManualBlock && (
                                        <div className="mt-16 pt-12 border-t border-slate-800">
                                            <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl flex flex-col items-center text-center">
                                                <Target className="w-12 h-12 mb-4 text-rose-500 opacity-80" />
                                                <h3 className="text-xl font-bold mb-2 text-rose-400">Content Generation Failed</h3>
                                                <p className="text-sm text-slate-400 mb-8 max-w-md leading-relaxed">Our AI ran into a speedbump while generating this session. You can study this topic independently, or try regenerating the tasks using a different model.</p>
                                                <Button
                                                    onClick={handleRetryGeneration}
                                                    disabled={submitting}
                                                    className="w-full max-w-sm py-4 text-white bg-rose-600 hover:bg-rose-500 border-none shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all font-bold"
                                                    icon={submitting ? Loader2 : Sparkles}
                                                >
                                                    {submitting ? "Regenerating Session..." : "Retry AI Generation"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Card>

                                {/* Evaluation / Feedback Section in its own distinct card */}
                                {!currentTask.is_completed && (
                                    <Card className="mt-8 border-slate-800/80 bg-slate-900/20 overflow-hidden shadow-lg shadow-black/50" hover={false}>
                                        <div className="max-w-xl mx-auto py-4">
                                            <div className="flex flex-col items-center text-center mb-8">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4">
                                                    <Activity className="text-indigo-400" size={24} />
                                                </div>
                                                <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Self-Evaluation</h3>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">How well did you grasp this concept?</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                                                {[
                                                    { id: 'clear', label: 'Clear', color: 'emerald', description: 'Understood well' },
                                                    { id: 'partial', label: 'Partial', color: 'amber', description: 'Need more review' },
                                                    { id: 'not_clear', label: 'Struggling', color: 'rose', description: 'Quite difficult' }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setFeedback({ ...feedback, level: opt.id })}
                                                        className={`p-4 rounded-xl border-2 transition-all group flex flex-col items-center justify-center text-center ${feedback.level === opt.id
                                                            ? `bg-${opt.color}-500/10 border-${opt.color}-500/50 text-${opt.color}-400`
                                                            : 'bg-slate-950/50 border-slate-800/60 text-slate-500 hover:border-slate-700'
                                                            }`}
                                                    >
                                                        <span className="font-black text-xs uppercase tracking-wider mb-1">{opt.label}</span>
                                                        <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">{opt.description}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <textarea
                                                placeholder="Focus points or specific gaps you noticed..."
                                                value={feedback.note}
                                                onChange={(e) => setFeedback({ ...feedback, note: e.target.value })}
                                                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-300 text-xs focus:ring-1 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all mb-6 min-h-[100px] font-medium"
                                            />

                                            <Button
                                                onClick={handleSubmitFeedback}
                                                disabled={submitting}
                                                className="w-full h-12 text-sm font-black uppercase tracking-widest border-none bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)]"
                                                icon={submitting ? Loader2 : CheckCircle2}
                                            >
                                                {submitting ? "Processing..." : "Submit & Continue"}
                                            </Button>
                                        </div>
                                    </Card>
                                )}
                                {currentTask.is_completed && (
                                    <div className="mt-8 flex justify-center">
                                        <Button
                                            onClick={() => {
                                                if (currentTaskIndex < tasks.length - 1) {
                                                    setCurrentTaskIndex(prev => prev + 1);
                                                }
                                            }}
                                            className="w-full max-w-sm h-12"
                                            icon={ArrowRight}
                                        >
                                            Next Task
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                            <Sparkles size={48} className="text-emerald-400 mb-6" />
                            <h2 className="text-2xl font-black text-white mb-2">Session Completed!</h2>
                            <p className="text-slate-400 mb-8">Great job! You've mastered all the units for today.</p>
                            <div className="flex flex-col space-y-3 w-full max-w-sm px-4">
                                <Button
                                    onClick={handleExit}
                                    icon={ChevronLeft}
                                    variant="primary"
                                    className="w-full py-4 text-base"
                                >
                                    Finish & Exit
                                </Button>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="ghost"
                                    className="w-full text-sm text-slate-500 hover:text-slate-300"
                                    size="sm"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudySession;
