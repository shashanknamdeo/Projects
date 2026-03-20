import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen, TrendingUp, AlertCircle, PlusCircle, LogOut, ChevronRight, LayoutDashboard, Target, Star, Layers, Activity, Search, Clock, Trash2, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import MeshBackground from '../components/MeshBackground';

const Dashboard = () => {
    const [progress, setProgress] = useState(null);
    const [studyPlans, setStudyPlans] = useState([]);
    const [weakTopics, setWeakTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionLoading, setSessionLoading] = useState(null);

    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [progRes, plansRes, weakRes] = await Promise.all([
                api.get('progress/'),
                api.get('study-plan/'),
                api.get('progress/weak-topics/')
            ]);
            setProgress(progRes.data);
            setStudyPlans(plansRes.data);
            setWeakTopics(weakRes.data);

            // Redirection for onboarding if demographics are missing
            if (!progRes.data.age_group || !progRes.data.stream) {
                navigate('/onboarding');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeletePlan = async (e, planId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this study plan?')) {
            try {
                await api.delete(`study-plan/${planId}/delete/`);
                setStudyPlans(studyPlans.filter(p => p.id !== planId));
                api.post('activity/log/', {
                    action: "Study Plan Deleted",
                    details: { plan_id: planId }
                }).catch(console.error);
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Could not delete the plan. Please try again.');
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-slate-400 font-semibold">Loading your workspace...</p>
            </div>
        </div>
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    // Calculate if the user has actually started studying
    const hasStarted = studyPlans.length > 0 || (progress?.confidence_score > 0);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-primary pb-20">
            <MeshBackground />

            {/* Professional Header */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center px-4">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/assets/images/logo.png" alt="NeuroLearn Logo" className="h-8 md:h-10 mt-1" />
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-6">
                        <Button variant="ghost" onClick={() => navigate('/profile')} icon={User} className="text-slate-300 hover:text-white">
                            Profile
                        </Button>
                        <Button variant="ghost" onClick={logout} icon={LogOut} className="text-slate-300 hover:text-white">
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <motion.main
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-5xl mx-auto px-4 py-6 relative z-10"
            >
                <div className="mb-8 px-1">
                    <h1 className="text-2xl text-heading mb-0.5">Hello, {progress?.user_name || 'User'}</h1>
                    <p className="text-xs text-slate-500 font-medium">Overview of your learning progress.</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                    {/* Mastery Level */}
                    <Card className="flex items-start space-x-6" delay={0.05}>
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                            <Star className="text-indigo-400" size={28} />
                        </div>
                        <div className="pt-1">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Proficiency Level</p>
                            <h4 className="text-xl font-bold text-white leading-tight">{progress?.mastery_level || 'Beginner'}</h4>
                        </div>
                    </Card>

                    {/* Active Plans */}
                    <Card className="flex items-start space-x-6" delay={0.1}>
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <BookOpen className="text-emerald-400" size={28} />
                        </div>
                        <div className="pt-1">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Study Plans</p>
                            <h4 className="text-xl font-bold text-white leading-tight">{studyPlans.length} Total</h4>
                        </div>
                    </Card>

                    {/* Progress Score */}
                    <Card className="flex flex-col justify-center" delay={0.15}>
                        <div className="flex justify-between items-center mb-5">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Overall Confidence</p>
                            <span className="text-2xl font-extrabold text-indigo-400">{Math.round(progress?.confidence_score || 0)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress?.confidence_score || 0}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-indigo-500 rounded-full"
                            />
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Study Plans */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-bold text-white">Your Study Plans</h2>
                            <Button onClick={() => navigate('/create-plan')} size="sm" icon={PlusCircle}>
                                New Study Plan
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {studyPlans.length > 0 ? (
                                studyPlans.map((plan, i) => (
                                    <Card
                                        key={plan.id}
                                        className={`cursor-pointer group flex flex-col h-full !pb-8`}
                                        delay={0.2 + i * 0.05}
                                        onClick={() => navigate(`/plan/${plan.id}`)}
                                    >
                                        <div className="mb-6 flex items-center justify-between">
                                            <span className="text-xs font-bold px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                                                {plan.total_days} Days
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => handleDeletePlan(e, plan.id)}
                                                    className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                                                    title="Delete Plan"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <ChevronRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={20} />
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-200 mb-4 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{plan.topic}</h4>
                                        <div className="mt-auto flex items-center space-x-4 text-slate-500 text-sm font-semibold">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                                    <Clock size={14} className="text-indigo-400" />
                                                </div>
                                                <span>{plan.daily_minutes} min daily</span>
                                            </div>
                                            <div className="flex items-center space-x-2 capitalize">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                                    <Target size={14} className="text-emerald-400" />
                                                </div>
                                                <span>{plan.goal_type}</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
                                    <Activity size={48} className="text-slate-700 mb-6" />
                                    <p className="text-slate-400 font-bold text-lg mb-2">No study plans created yet.</p>
                                    <p className="text-slate-500 text-sm">Create your first plan to start your learning journey.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Areas for Improvement */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white px-1">Areas for Improvement</h2>
                        <Card className="border-slate-800 !bg-slate-900/30" hover={false} delay={0.4}>
                            {weakTopics.length > 0 ? (
                                <div className="space-y-4">
                                    {weakTopics.map((topic, i) => (
                                        <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                            <div className="truncate pr-4">
                                                <p className="text-slate-200 font-bold text-sm truncate">{topic.topic_title}</p>
                                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mt-1">Review Required</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="shrink-0 p-2 text-indigo-400 hover:bg-indigo-500/10"
                                                onClick={() => {
                                                    if (topic.session_id) {
                                                        navigate(`/session/${topic.session_id}${topic.sub_session_id ? `?sub_id=${topic.sub_session_id}` : ''}`);
                                                    }
                                                }}
                                            >
                                                Study
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
                                        <Activity className={hasStarted ? "text-emerald-400" : "text-slate-500"} size={32} />
                                    </div>
                                    <p className="text-slate-200 font-bold text-lg mb-2">
                                        {hasStarted ? "Ready to Grow?" : "Welcome to NeuroLearn"}
                                    </p>
                                    <p className="text-slate-500 font-medium text-sm px-6 leading-relaxed">
                                        {hasStarted
                                            ? "You've made a great start! Keep up the consistent work to see your confidence grow."
                                            : "Create your first study plan or pick a topic to begin your personalized learning path."}
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </motion.main>
        </div>
    );
};

export default Dashboard;
