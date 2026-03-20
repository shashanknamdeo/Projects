import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Target, Clock, Calendar, Rocket, Sparkles, Loader2, PlusCircle, ChevronLeft, BookOpen, GraduationCap, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import MeshBackground from '../components/MeshBackground';

const StudyPlanCreator = () => {
    const [topic, setTopic] = useState('');
    const [goalType, setGoalType] = useState('job');
    const [currentLevel, setCurrentLevel] = useState('beginner');
    const [hours, setHours] = useState(1);
    const [days, setDays] = useState(1);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [startToday, setStartToday] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const [year, month, day] = isoString.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('study-plan/create/', {
                topic,
                goal_type: goalType,
                current_level: currentLevel,
                daily_minutes: Math.round(hours * 60),
                total_days: days,
                start_date: startDate
            });
            navigate(`/plan/${res.data.id || res.data.plan_id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8 relative overflow-hidden font-primary">
            <MeshBackground />

            {/* Premium Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 180, 360]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full mb-8 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">AI is crafting your path...</h2>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                                Our neural network is analyzing your topic and architecting a personalized curriculum just for you.
                            </p>
                        </motion.div>

                        <div className="mt-12 flex space-x-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                    className="w-2 h-2 bg-indigo-500 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl relative z-10"
            >
                <div className="mb-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-slate-500 hover:text-indigo-400 transition-all font-bold text-sm group"
                    >
                        <ChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={18} />
                        Back to Workspace
                    </button>
                    <div className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                        New Study Plan
                    </div>
                </div>

                <Card className="p-6 md:p-8 border-slate-800 shadow-2xl" hover={false}>
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Create Study Plan</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-80">Personalize your learning path</p>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-8">
                        {/* Section 1: Core Topic */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-1">
                                <Target className="text-indigo-400" size={16} />
                                <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Learning Topic</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Learning Topic</label>
                                    <Input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="E.g., Quantum Physics, Web Development..."
                                        required
                                        inputClassName="h-[48px] text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'beginner', label: 'Beginner' },
                                            { id: 'intermediate', label: 'Intermed.' },
                                            { id: 'advanced', label: 'Advanced' }
                                        ].map((level) => (
                                            <button
                                                key={level.id}
                                                type="button"
                                                onClick={() => setCurrentLevel(level.id)}
                                                className={`h-[48px] rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${currentLevel === level.id
                                                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                                                    : 'bg-slate-950/50 border-slate-800/60 text-slate-500 hover:border-slate-700'
                                                    }`}
                                            >
                                                {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Learning Goal</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {[
                                        { id: 'job', label: 'Job', icon: GraduationCap, desc: 'Interviews & Practical' },
                                        { id: 'exam', label: 'Exam', icon: BookOpen, desc: 'Theory & Syllabus' },
                                        { id: 'career_switch', label: 'Switch', icon: Zap, desc: 'Extra Basics' },
                                        { id: 'skill_upgrade', label: 'Upgrade', icon: Rocket, desc: 'More Depth' },
                                        { id: 'curiosity', label: 'Curiosity', icon: Sparkles, desc: 'Exploratory' }
                                    ].map((goal) => (
                                        <button
                                            key={goal.id}
                                            type="button"
                                            onClick={() => setGoalType(goal.id)}
                                            className={`p-3.5 rounded-xl border-2 transition-all text-left flex flex-col space-y-2 ${goalType === goal.id
                                                ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/10'
                                                : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${goalType === goal.id ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'}`}>
                                                    <goal.icon size={14} />
                                                </div>
                                                <div className={`text-[11px] font-black uppercase tracking-tight ${goalType === goal.id ? 'text-white' : 'text-slate-400'}`}>{goal.label}</div>
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-500 leading-tight uppercase tracking-tighter opacity-60">{goal.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800/50">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Clock className="text-emerald-400" size={16} />
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Commitment</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hours / Day</label>
                                        <Input
                                            type="number"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                            required
                                            inputClassName="h-[48px] text-sm text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Days</label>
                                        <Input
                                            type="number"
                                            value={days}
                                            onChange={(e) => setDays(e.target.value)}
                                            required
                                            inputClassName="h-[48px] text-sm text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Calendar className="text-amber-400" size={16} />
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Schedule</h3>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 items-end">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Timeline</label>
                                        <div
                                            onClick={() => setStartToday(!startToday)}
                                            className={`flex items-center justify-center h-[48px] rounded-xl border-2 transition-all cursor-pointer ${startToday
                                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                                                : 'bg-slate-950/50 border-slate-800/60 text-slate-500'
                                                }`}
                                        >
                                            <Rocket className={`mr-2 transition-transform ${startToday ? 'scale-110' : ''}`} size={16} />
                                            <span className="font-black text-[10px] uppercase tracking-widest">Start Today</span>
                                        </div>
                                    </div>

                                    <div 
                                        className="relative group cursor-pointer space-y-2"
                                        onClick={() => startToday && setStartToday(false)}
                                    >
                                        <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${startToday ? 'text-slate-600' : 'text-slate-500'}`}>Pick Date</label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required={!startToday}
                                            disabled={startToday}
                                            data-date={formatDate(startDate)}
                                            inputClassName={`h-[48px] text-sm text-center transition-all ${startToday ? 'opacity-30 cursor-pointer pointer-events-none' : 'opacity-100'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 bg-indigo-600 hover:bg-indigo-500 transition-all"
                                icon={loading ? Loader2 : Sparkles}
                            >
                                {loading ? "Creating Plan..." : "Generate Study Plan"}
                            </Button>
                        </div>
                    </form>
                </Card>

                <p className="text-center mt-10 text-slate-600 text-xs font-semibold">
                    AI-Powered Personalization Protocol
                </p>
            </motion.div>
        </div>
    );
};

export default StudyPlanCreator;
