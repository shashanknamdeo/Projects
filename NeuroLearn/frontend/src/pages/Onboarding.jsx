import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { GraduationCap, Calendar, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import MeshBackground from '../components/MeshBackground';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age_group: '',
        stream: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const ageOptions = [
        { value: 'under_18', label: 'Below 18', desc: 'Personalized tone for young learners' },
        { value: '18_22', label: '18–22', desc: 'Focus on higher education & career' },
        { value: '23_30', label: '23–30', desc: 'Professional & industry-oriented' },
        { value: 'over_30', label: '30+', desc: 'Efficient, streamlined learning' },
    ];

    const streamOptions = [
        { value: 'science_eng', label: 'Science / Engineering', desc: 'Technical & analytical focus' },
        { value: 'arts_humanities', label: 'Arts / Humanities', desc: 'Intuitive & conceptual approach' },
        { value: 'commerce_finance', label: 'Commerce / Finance', desc: 'Business & real-world examples' },
        { value: 'medical_bio', label: 'Medical / Biology', desc: 'Biological & symbols allowed' },
        { value: 'other', label: 'Other / Not sure', desc: 'Broad & inclusive examples' },
    ];

    const handleComplete = async () => {
        setLoading(true);
        try {
            await api.patch('auth/profile/', formData);
            navigate('/');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const container = {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden font-primary">
            <MeshBackground />

            {/* Progress indicator */}
            <div className="fixed top-8 flex space-x-2 z-50">
                {[1, 2].map((i) => (
                    <div 
                        key={i}
                        className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-500' : 'bg-slate-800'}`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        variants={container}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full max-w-lg relative z-10"
                    >
                        <div className="text-center mb-8">
                            <div className="inline-flex w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl items-center justify-center mb-4 shadow-xl">
                                <Calendar className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Your Journey Starts Here</h1>
                            <p className="text-slate-400 text-sm font-medium tracking-tight">Select your age group to help AI tailor the learning pace.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {ageOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFormData({ ...formData, age_group: opt.value })}
                                    className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                                        formData.age_group === opt.value
                                            ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_-10px_rgba(79,70,229,0.3)]'
                                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-bold ${formData.age_group === opt.value ? 'text-white' : 'text-slate-200'}`}>{opt.label}</h3>
                                        {formData.age_group === opt.value && <CheckCircle2 className="text-indigo-500 w-4 h-4" />}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-tight">{opt.desc}</p>
                                </button>
                            ))}
                        </div>

                        <Button 
                            className="w-full py-3 text-sm" 
                            disabled={!formData.age_group}
                            onClick={() => setStep(2)}
                            icon={ChevronRight}
                        >
                            Next Step
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        variants={container}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full max-w-lg relative z-10"
                    >
                        <div className="text-center mb-8">
                            <div className="inline-flex w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl items-center justify-center mb-4 shadow-xl">
                                <GraduationCap className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Tell us your background</h1>
                            <p className="text-slate-400 text-sm font-medium tracking-tight">Help us pick the best examples for you.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {streamOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFormData({ ...formData, stream: opt.value })}
                                    className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                                        formData.stream === opt.value
                                            ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_-10px_rgba(79,70,229,0.3)]'
                                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-bold ${formData.stream === opt.value ? 'text-white' : 'text-slate-200'}`}>{opt.label}</h3>
                                        {formData.stream === opt.value && <CheckCircle2 className="text-indigo-500 w-4 h-4" />}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-tight">{opt.desc}</p>
                                </button>
                            ))}
                        </div>

                        <div className="flex space-x-3">
                            <Button 
                                variant="secondary" 
                                className="w-1/3 py-3 text-sm"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button 
                                className="flex-1 py-3 text-sm" 
                                disabled={!formData.stream || loading}
                                onClick={handleComplete}
                                icon={loading ? null : Sparkles}
                            >
                                {loading ? 'Finalizing...' : 'Enter Workspace'}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
