import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Lock, Play, CheckCircle2, Clock,
    Calendar, Target, Sparkles, Unlock, Loader2
} from 'lucide-react';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import MeshBackground from '../components/MeshBackground';

const StudyPlanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unlocking, setUnlocking] = useState(null);
    const [unlockWarningSession, setUnlockWarningSession] = useState(null);

    const triggeredSessionsRef = useRef(new Set());

    const fetchPlanDetails = async (isPoll = false) => {
        try {
            const res = await api.get(`study-plan/${id}/`);
            setPlan(res.data);
            
            // Trigger generation for any pending sessions
            res.data.sessions.forEach(session => {
                if (session.generation_status === 'pending' && !triggeredSessionsRef.current.has(session.id)) {
                    triggeredSessionsRef.current.add(session.id);
                    triggerSessionTopics(session.id);
                }
            });
        } catch (err) {
            console.error("Failed to fetch plan details:", err);
        } finally {
            if (!isPoll) setLoading(false);
        }
    };

    const triggerSessionTopics = async (sessionId) => {
        try {
            await api.post(`study-plan/sessions/${sessionId}/trigger-topics/`);
        } catch (err) {
            console.error("Failed to trigger session topics:", err);
        }
    };

    useEffect(() => {
        fetchPlanDetails();
    }, [id]);

    // Polling logic for generating sessions
    useEffect(() => {
        if (!plan) return;

        const isGenerating = plan.sessions.some(s => s.generation_status === 'generating');
        
        if (isGenerating) {
            const interval = setInterval(() => {
                fetchPlanDetails(true);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [plan]);

    const handleUnlock = async (sessionId) => {
        try {
            setUnlocking(sessionId);
            await api.post(`study-plan/sessions/${sessionId}/unlock/`);
            await fetchPlanDetails();
        } catch (err) {
            console.error("Failed to unlock session:", err);
            alert("Could not unlock session. Please try again.");
        } finally {
            setUnlocking(null);
            setUnlockWarningSession(null);
        }
    };

    const handleStartSession = async (sessionId) => {
        // Since we are doing lazy generation, the backend start-session endpoint 
        // will handle creating tasks if they don't exist yet for that session day.
        try {
            setUnlocking(sessionId); // Use same loading state
            const res = await api.post(`study-plan/${id}/start-session/`, { session_id: sessionId });
            if (res.data.session_id) {
                navigate(`/session/${res.data.session_id}?plan_id=${id}`);
            }
        } catch (err) {
            console.error("Failed to start session:", err);
            alert("Could not start session. Please try again.");
        } finally {
            setUnlocking(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        </div>
    );

    if (!plan) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
            <h2 className="text-2xl font-bold mb-4">Plan not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 font-primary">
            <MeshBackground />

            <nav className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white flex items-center space-x-4"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-bold text-sm">Dashboard</span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <Sparkles className="text-white" size={18} />
                        </div>
                        <h1 className="text-lg font-black text-white tracking-tight uppercase">TIMELINE</h1>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 mt-8">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-600/20 to-violet-700/20 border border-indigo-500/20 rounded-2xl p-5 mb-8 backdrop-blur-xl"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{plan.topic}</h2>

                            <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                                    {plan.total_days} Day Master Plan
                                </span>
                                <span className="text-slate-500">•</span>
                                <span className="text-indigo-300/80">{plan.goal_type}</span>
                                <span className="text-slate-500">•</span>
                                <div className="flex items-center space-x-1 text-slate-400">
                                    <Clock size={12} />
                                    <span>{plan.daily_minutes}m / Day</span>
                                </div>
                                <span className="text-slate-500">•</span>
                                <div className="flex items-center space-x-1 text-slate-400">
                                    <Calendar size={12} />
                                    <span>
                                        {new Date(plan.start_date).toLocaleDateString()} - {(() => {
                                            const end = new Date(plan.start_date);
                                            end.setDate(end.getDate() + parseInt(plan.total_days));
                                            return end.toLocaleDateString();
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center -space-x-3">
                            {/* Visual Progress or Stats */}
                            <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-indigo-500/10">
                                <Target className="text-indigo-400" size={20} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Vertical Timeline */}
                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-[21px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500/50 via-slate-800 to-slate-800/20" />

                    <div className="space-y-6">
                        {plan.sessions.map((session, index) => {
                            const isLocked = !session.is_available;
                            const isCompleted = session.session_status === 'completed';
                            const isCurrent = session.is_available && !isCompleted;

                            return (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative pl-14"
                                >
                                    {/* Timeline Marker */}
                                    <div className={`absolute left-0 w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-500 z-10 ${isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                                        session.generation_status === 'generating' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse' :
                                        isCurrent ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105' :
                                            'bg-slate-900 border-slate-700 text-slate-500'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 size={18} /> :
                                            session.generation_status === 'generating' ? <Loader2 size={16} className="animate-spin" /> :
                                            isLocked ? <Lock size={16} /> :
                                                <Play size={16} className="ml-1" />}
                                    </div>

                                    <Card className={`group border transition-all ${isLocked ? 'opacity-60 border-slate-800' :
                                        isCurrent ? 'border-indigo-500/40 bg-indigo-500/5' :
                                            'border-emerald-500/20'
                                        }`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className={`text-base font-black tracking-tight mb-0.5 ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                                                    {(() => {
                                                        const d = new Date(plan.start_date);
                                                        d.setDate(d.getDate() + (session.day_number - 1));
                                                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                    })()} • {plan.topics[index]?.title || 'Study Session'}
                                                </h4>
                                                <p className="text-sm text-slate-400 font-medium">
                                                    {isCompleted ? 'Completed Mastery session' :
                                                        session.generation_status === 'generating' ? 'AI is synthesizing units...' :
                                                        isLocked ? 'Scheduled for later' :
                                                            'Ready for intensive learning'}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-3 mt-4 md:mt-0">
                                                {isLocked ? (
                                                    unlockWarningSession === session.id ? (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="flex flex-col bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 max-w-sm w-full"
                                                        >
                                                            <div className="text-amber-500 text-xs mb-3">
                                                                <span className="font-black flex items-center mb-1"><Sparkles size={14} className="mr-1" /> Consistency over Intensity</span>
                                                                It's best to study on the scheduled day. Studying consistently builds better retention than cramming.
                                                                <br /><br />
                                                                If you don't have time on the scheduled day, you may unlock it now. <strong>Do not open this just to look around</strong>, incomplete sessions will negatively impact your profile analytics.
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    onClick={() => handleUnlock(session.id)}
                                                                    disabled={unlocking === session.id}
                                                                    className="flex-1 text-xs py-2 bg-amber-600 hover:bg-amber-500 text-white"
                                                                    size="sm"
                                                                >
                                                                    {unlocking === session.id ? "Unlocking..." : "I understand, Unlock"}
                                                                </Button>
                                                                <Button
                                                                    onClick={() => setUnlockWarningSession(null)}
                                                                    variant="ghost"
                                                                    className="text-xs py-2 text-slate-400 hover:text-slate-200"
                                                                    size="sm"
                                                                    disabled={unlocking === session.id}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setUnlockWarningSession(session.id)}
                                                            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl transition-all uppercase tracking-tighter whitespace-nowrap"
                                                        >
                                                            <Unlock size={14} />
                                                            <span>Unlock Early</span>
                                                        </button>
                                                    )
                                                ) : (
                                                    <Button
                                                        variant={isCompleted ? "secondary" : "primary"}
                                                        onClick={() => handleStartSession(session.id)}
                                                        disabled={unlocking === session.id || session.generation_status === 'generating'}
                                                        icon={unlocking === session.id ? Loader2 : (session.generation_status === 'generating' ? Loader2 : (isCompleted ? CheckCircle2 : Play))}
                                                        className="w-44 h-10 font-bold justify-center"
                                                    >
                                                        {unlocking === session.id ? "Loading..." : (session.generation_status === 'generating' ? "Generating..." : (isCompleted ? "Review Session" : "Start Session"))}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudyPlanDetail;
