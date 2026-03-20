import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { LogIn, User, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import MeshBackground from '../components/MeshBackground';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Check if input is only digits (phone number) and enforce 10 digits
        const isPhone = /^\d+$/.test(identifier);
        if (isPhone && identifier.length !== 10) {
            setError('Please enter exactly 10 digits for your phone number.');
            return;
        }

        try {
            const res = await api.post('auth/login/', { username: identifier, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            navigate('/');
        } catch (err) {
            setError('Invalid phone number/email or password.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden font-primary">
            <MeshBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex justify-center mb-6"
                    >
                        <img src="/assets/images/logo.png" alt="NeuroLearn Logo" className="h-14 md:h-16" />
                    </motion.div>
                    <p className="text-slate-400 font-medium text-sm px-4">Where Artificial Neuron Help Human Neuron</p>
                </div>

                <Card className="p-8 md:p-12 border-slate-800 shadow-2xl" hover={false}>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-5">
                            <Input
                                label="Phone Number or Email"
                                icon={User}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Enter your phone number or email"
                                required
                            />

                            <Input
                                label="Password"
                                type="password"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full py-4 text-base" icon={LogIn}>
                            Sign In
                        </Button>
                    </form>
                    
                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 font-medium text-sm">
                            Don't have an account? 
                            <Link to="/register" className="ml-2 text-indigo-600 hover:text-indigo-700 transition-all font-bold underline underline-offset-4">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </Card>
                
                <p className="mt-10 text-center text-slate-400 text-xs font-semibold tracking-wide">
                    &copy; 2026 NeuroLearn Platform
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
