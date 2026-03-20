import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen, HelpCircle, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles, ChevronLeft, Zap, Shield, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import MeshBackground from '../components/MeshBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LessonSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState('reading'); // 'reading', 'quiz', 'feedback'
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchLesson = async () => {
            // Clear old state to prevent "ghost" content from previous sessions
            setLesson(null);
            setQuestions([]);
            setQuizResult(null);
            setCurrentStep('reading');
            setSelectedAnswer('');
            setLoading(true);

            try {
                const lessonRes = await api.get(`lesson/${id}/`);
                setLesson(lessonRes.data);
                const quizRes = await api.get(`quiz/questions/?lesson_id=${id}`);
                setQuestions(quizRes.data);

                // Log Lesson Started
                api.post('activity/log/', {
                    action: "Lesson Started",
                    details: { lesson_id: id, title: lessonRes.data.title }
                }).catch(console.error);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [id]);

    const handleOptionClick = async (option) => {
        if (selectedAnswer || submitting) return; // lock selection

        setSelectedAnswer(option);
        setSubmitting(true);

        try {
            const currentQuestion = questions[0];
            const res = await api.post('quiz/submit/', {
                question_id: currentQuestion.id,
                selected_answer: option
            });
            setQuizResult(res.data);

            // Log Quiz Result
            api.post('activity/log/', {
                action: "Quiz Submitted",
                details: {
                    lesson_id: id,
                    is_correct: res.data.is_correct,
                    score: res.data.confidence_delta
                }
            }).catch(console.error);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading session...</p>
        </div>
    );

    const stepLabel = {
        reading: "Study Material",
        quiz: "Knowledge Check",
        feedback: "Results"
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-primary pb-20">
            <MeshBackground />

            {/* Clean Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-2.5">
                <div className="max-w-6xl mx-auto flex items-center px-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors mr-4 group"
                    >
                        <ChevronLeft size={24} className="text-slate-500 group-hover:text-white" />
                    </button>
                    <div>
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{stepLabel[currentStep]}</p>
                        <h2 className="text-2xl font-bold text-white truncate max-w-lg">
                            {lesson?.title}
                        </h2>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                <AnimatePresence mode="wait">
                    {currentStep === 'reading' && (
                        <motion.div
                            key="reading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            <Card className="p-6 md:p-10 border-slate-800 shadow-2xl" hover={false}>
                                <div className="prose prose-invert lg:prose-xl max-w-none prose-headings:text-white prose-a:text-indigo-400 prose-code:text-indigo-300 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-strong:text-white">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {lesson?.content}
                                    </ReactMarkdown>
                                </div>
                            </Card>
                            <div className="flex justify-center">
                                <Button
                                    onClick={() => setCurrentStep('quiz')}
                                    className="w-full max-w-sm"
                                    icon={ArrowRight}
                                >
                                    Take Quiz
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-10"
                    >
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white mb-0.5">
                                Assess Your Understanding
                            </h3>
                            <p className="text-xs text-slate-500">Choose the correct answer.</p>
                        </div>

                        <Card className="p-6 border-slate-800 shadow-2xl" hover={false}>
                            <p className="text-base font-bold text-slate-200 mb-6 leading-relaxed">
                                {questions[0]?.question_text}
                            </p>
                            <div className="space-y-4">
                                {questions[0]?.options.map((option, i) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectAnswer = option === questions[0]?.correct_answer;
                                    const hasAnswered = !!selectedAnswer;

                                    let btnClass = 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300';
                                    let iconClass = 'border-slate-700 bg-slate-800 text-slate-400';

                                    if (hasAnswered) {
                                        if (isCorrectAnswer) {
                                            btnClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                                            iconClass = 'border-emerald-500 bg-emerald-500 text-white';
                                        } else if (isSelected && !isCorrectAnswer) {
                                            btnClass = 'border-rose-500 bg-rose-500/10 text-rose-400';
                                            iconClass = 'border-rose-500 bg-rose-500 text-white';
                                        } else {
                                            btnClass = 'border-slate-800 bg-slate-900/50 text-slate-600 opacity-50';
                                            iconClass = 'border-slate-800 bg-slate-800 text-slate-600';
                                        }
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleOptionClick(option)}
                                            disabled={hasAnswered}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center ${btnClass} ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg border-2 mr-4 flex items-center justify-center text-sm font-bold transition-all ${iconClass}`}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="font-semibold">{option}</span>
                                            {hasAnswered && isCorrectAnswer && <CheckCircle2 className="ml-auto text-emerald-500" size={20} />}
                                            {hasAnswered && isSelected && !isCorrectAnswer && <XCircle className="ml-auto text-rose-500" size={20} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        <AnimatePresence>
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
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{quizResult.explanation}</ReactMarkdown>
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

                                    <div className="flex gap-4 max-w-md mx-auto">
                                        {!quizResult.is_correct && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setSelectedAnswer('');
                                                    setQuizResult(null);
                                                }}
                                                className="flex-1 py-4"
                                                icon={Target}
                                            >
                                                Try Again
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => navigate('/')}
                                            className="flex-1 py-4"
                                            icon={ChevronLeft}
                                            variant="primary"
                                        >
                                            Back to Dashboard
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default LessonSession;
