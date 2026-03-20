import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen, HelpCircle, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles, ChevronLeft, Zap, Shield, Target, GraduationCap, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import MeshBackground from '../components/MeshBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const QuizSession = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const subSessionId = searchParams.get('sub_session_id');
    const nextSubId = searchParams.get('next_sub_id');
    const planId = searchParams.get('plan_id');
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                let url = 'quiz/questions/';
                if (subSessionId) url += `?sub_session_id=${subSessionId}`;
                else if (sessionId) url += `?session_id=${sessionId}`;
                
                const res = await api.get(url);
                setQuestions(res.data);

                // Log Quiz Started
                api.post('activity/log/', {
                    action: "Quiz Started",
                    details: { session_id: sessionId, sub_session_id: subSessionId }
                }).catch(console.error);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (sessionId || subSessionId) fetchQuestions();
        else navigate('/');
    }, [sessionId, subSessionId, navigate]);

    const handleOptionClick = (option) => {
        if (quizResult || submitting) return;
        
        setSelectedAnswers(prev => 
            prev.includes(option) 
                ? prev.filter(a => a !== option) 
                : [...prev, option]
        );
    };

    const handleSubmitAnswer = async () => {
        if (selectedAnswers.length === 0 || submitting) return;
        
        setSubmitting(true);
        try {
            const currentQuestion = questions[currentQuestionIndex];
            const res = await api.post('quiz/submit/', {
                question_id: currentQuestion.id,
                selected_answers: selectedAnswers
            });
            setQuizResult(res.data);
            if (res.data.is_correct) setScore(s => s + 1);

            // Log Quiz Result
            api.post('activity/log/', {
                action: "Quiz Answer Submitted",
                details: {
                    question_id: currentQuestion.id,
                    is_correct: res.data.is_correct
                }
            }).catch(console.error);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswers([]);
            setQuizResult(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // For multi-question quizzes (sessions), show results page
            // But for single question quizzes (sub-sessions), we usually navigate away in the button onClick
            setCompleted(true);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-primary">
            <MeshBackground />
            <div className="flex flex-col items-center relative z-10">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Curating Challenges...</p>
            </div>
        </div>
    );

    if (completed) return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-primary p-6">
            <MeshBackground />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg relative z-10">
                <Card className="text-center p-12 shadow-2xl border-slate-800">
                    <div className="w-24 h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/30">
                        <GraduationCap size={48} className="text-indigo-400" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tight">Quiz Complete!</h2>
                    <p className="text-slate-400 mb-10 font-medium">You scored <span className="text-white font-bold">{score}</span> out of <span className="text-white font-bold">{questions.length}</span>.</p>
                    <Button 
                        onClick={() => {
                            if (nextSubId) {
                                navigate(`/session/${sessionId}?sub_id=${nextSubId}${planId ? `&plan_id=${planId}` : ''}`);
                            } else if (planId) {
                                navigate(`/plan/${planId}`);
                            } else {
                                navigate('/');
                            }
                        }} 
                        className="w-full py-4 text-lg"
                    >
                        {nextSubId ? 'Continue to Next Unit' : 'Finish Session'}
                    </Button>
                </Card>
            </motion.div>
        </div>
    );

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-primary pb-20">
            <MeshBackground />

            {/* Premium Header */}
            <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-2.5 transition-all">
                <div className="max-w-6xl mx-auto flex justify-between items-center px-6">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => {
                                const params = [];
                                if (planId) params.push(`plan_id=${planId}`);
                                if (subSessionId) params.push(`sub_id=${subSessionId}`);
                                const paramStr = params.length > 0 ? `?${params.join('&')}` : '';
                                if (sessionId) navigate(`/session/${sessionId}${paramStr}`);
                                else navigate('/');
                            }} 
                            className="p-2 hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 block">Knowledge Mastery</span>
                            <h2 className="text-lg font-bold text-white tracking-tight">Session Assessment</h2>
                        </div>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                        <div>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Question</span>
                            <div className="text-sm font-black text-white">{currentQuestionIndex + 1} <span className="text-slate-600">/ {questions.length}</span></div>
                        </div>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-2 px-6">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div key="q" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <Card className="p-4 md:p-6 border-slate-800 shadow-2xl relative overflow-hidden" hover={false}>
                            <HelpCircle className="absolute -top-10 -right-10 text-white/5" size={150} />
                            <h3 className="text-lg font-bold text-white mb-6 leading-relaxed relative z-10">{currentQuestion?.question_text}</h3>
                            <div className="space-y-4">
                                {currentQuestion?.options.map((option, i) => {
                                    const isSelected = selectedAnswers.includes(option);
                                    const hasAnswered = !!quizResult;
                                    
                                    // Robust prefix regex for stripping and fuzzy matching
                                    const prefixRegex = /^([A-D])[\s.)-]+\s*/i;
                                    const match = typeof option === 'string' ? option.match(prefixRegex) : null;
                                    const optionPlain = match ? option.replace(prefixRegex, '') : option;
                                    const optionLabel = match ? match[1].toUpperCase() : null;
                                    
                                    // Robust check for correctness
                                    const correctAnswers = currentQuestion?.correct_answers || [];
                                    const isCorrectAnswer = Array.isArray(correctAnswers) && correctAnswers.some(ans => {
                                        if (ans === null || ans === undefined) return false;
                                        const cleanAns = ans.toString().trim().toUpperCase();
                                        const cleanOptFull = (option || "").toString().trim().toUpperCase();
                                        const cleanOptPlain = (optionPlain || "").toString().trim().toUpperCase();
                                        
                                        // Match full text, plain text, or the label itself
                                        return cleanAns === cleanOptFull || 
                                               cleanAns === cleanOptPlain || 
                                               (optionLabel && cleanAns === optionLabel);
                                    });

                                    const label = String.fromCharCode(65 + i);

                                    let btnClass = 'border-slate-800/60 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40';
                                    let iconClass = 'border-slate-800 bg-slate-950 text-slate-600';

                                    if (hasAnswered) {
                                        if (isCorrectAnswer) {
                                            btnClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
                                            iconClass = 'border-emerald-500 bg-emerald-500 text-white shadow-lg';
                                        } else if (isSelected && !isCorrectAnswer) {
                                            btnClass = 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]';
                                            iconClass = 'border-rose-500 bg-rose-500 text-white shadow-lg';
                                        } else {
                                            btnClass = 'border-slate-800/40 bg-slate-900/20 text-slate-600 opacity-50';
                                            iconClass = 'border-slate-800 bg-slate-950 text-slate-600 opacity-50';
                                        }
                                    } else if (isSelected) {
                                        btnClass = 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]';
                                        iconClass = 'border-indigo-500 bg-indigo-500 text-white shadow-lg';
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleOptionClick(option)}
                                            disabled={hasAnswered}
                                            className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-center group ${btnClass} ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl border-2 mr-5 flex items-center justify-center text-sm font-black transition-all ${iconClass}`}>
                                                {label}
                                            </div>
                                            <span className="font-bold text-lg">
                                                {optionPlain}
                                            </span>
                                            {hasAnswered && isCorrectAnswer && <CheckCircle2 className="ml-auto text-emerald-500" size={24} />}
                                            {hasAnswered && isSelected && !isCorrectAnswer && <XCircle className="ml-auto text-rose-500" size={24} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        <AnimatePresence>
                            {!quizResult && selectedAnswers.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex justify-center">
                                    <Button 
                                        onClick={handleSubmitAnswer} 
                                        disabled={submitting}
                                        className="w-full max-w-sm py-4 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] bg-indigo-600 hover:bg-indigo-500"
                                        icon={submitting ? Loader2 : Send}
                                    >
                                        {submitting ? "Checking..." : "Submit Answer"}
                                    </Button>
                                </motion.div>
                            )}

                            {submitting && !quizResult && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-col items-center justify-center py-8 text-slate-400"
                                >
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                                    <p className="font-bold animate-pulse uppercase tracking-widest text-xs">Generating Insights...</p>
                                </motion.div>
                            )}

                            {quizResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <Card className={`p-8 border-2 overflow-hidden relative ${quizResult.is_correct ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`} hover={false}>
                                        <div className="relative z-10">
                                            <h3 className={`text-xl font-black mb-4 tracking-tight ${quizResult.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {quizResult.is_correct ? "Outstanding!" : "Let's review this"}
                                            </h3>

                                            <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50 mb-6 shadow-inner">
                                                <div className="prose prose-invert prose-indigo max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{quizResult.explanation?.explanation_md}</ReactMarkdown>
                                                </div>
                                            </div>

                                            {!quizResult.is_correct && quizResult.simpler_explanation && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-2 px-1">
                                                        <Zap size={14} className="text-indigo-400" />
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Neural Simplification</span>
                                                    </div>
                                                    <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10 shadow-lg shadow-indigo-950/20">
                                                        <div className="prose prose-invert prose-indigo prose-sm max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-white">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{quizResult.simpler_explanation}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                    <Button 
                                        onClick={() => {
                                            if (currentQuestionIndex < questions.length - 1) {
                                                handleNext();
                                            } else {
                                                // If only one question (sub-session quiz), go directly to completion logic
                                                if (nextSubId) {
                                                    navigate(`/session/${sessionId}?sub_id=${nextSubId}${planId ? `&plan_id=${planId}` : ''}`);
                                                } else if (planId) {
                                                    navigate(`/plan/${planId}`);
                                                } else {
                                                    navigate('/');
                                                }
                                            }
                                        }} 
                                        className="w-full py-5 text-xl tracking-tight" 
                                        icon={ArrowRight}
                                    >
                                        {currentQuestionIndex < questions.length - 1 ? "Next Question" : (nextSubId ? "Continue to Next Unit" : "Finish Session")}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default QuizSession;
