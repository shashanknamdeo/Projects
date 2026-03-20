import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Phone, Mail, ArrowLeft, Calendar, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import MeshBackground from '../components/MeshBackground';

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('auth/profile/');
                setProfile(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-primary">
            <MeshBackground />

            {/* Header */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center">
                    <Button variant="ghost" onClick={() => navigate(-1)} icon={ArrowLeft} className="text-slate-400 hover:text-white mr-4">
                        Back
                    </Button>
                    <h1 className="text-xl font-bold text-white">User Profile</h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="p-8 md:p-12 border-slate-800 shadow-2xl overflow-hidden" hover={false}>
                        <div className="flex flex-col items-center mb-8">
                            <div className="flex items-center justify-center mb-6 w-full max-w-sm">
                                <img src="/assets/images/logo.png" alt="NeuroLearn Logo" className="w-full h-auto max-w-[280px]" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-1">
                                {profile?.first_name} {profile?.last_name}
                            </h2>
                            <p className="text-slate-400">NeuroLearn Member</p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center space-x-4">
                                    <div className="p-3 bg-slate-800 rounded-lg text-amber-400">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Age Group</p>
                                        <p className="text-slate-200 font-medium">{profile?.age_group ? profile.age_group.replace('_', ' ').toUpperCase() : 'Not provided'}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center space-x-4">
                                    <div className="p-3 bg-slate-800 rounded-lg text-purple-400">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Background Stream</p>
                                        <p className="text-slate-200 font-medium">{profile?.stream ? profile.stream.replace('_', ' ').toUpperCase() : 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center space-x-4">
                                <div className="p-3 bg-slate-800 rounded-lg text-indigo-400">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</p>
                                    <p className="text-slate-200 font-medium">{profile?.phone_number || 'Not provided'}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center space-x-4">
                                <div className="p-3 bg-slate-800 rounded-lg text-emerald-400">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-slate-200 font-medium">{profile?.email || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default UserProfile;
