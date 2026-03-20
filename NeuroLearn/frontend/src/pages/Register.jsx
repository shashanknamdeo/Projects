import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, Mail, User, Lock, Sparkles, Target, GraduationCap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Card from '../components/Card';
import MeshBackground from '../components/MeshBackground';

const Register = () => {
    const [formData, setFormData] = useState({
        phone_number: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('auth/register/', formData);
            navigate('/login');
        } catch (err) {
            console.error("Registration error:", err.response?.data);
            const errorData = err.response?.data;
            if (errorData) {
                // Collect all error messages into a single string
                const messages = Object.keys(errorData).map(key => {
                    const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                    return `${fieldName}: ${errorData[key].join(', ')}`;
                });
                setError(messages.join(' | '));
            } else {
                setError('Account registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden font-primary bg-slate-950">
            <MeshBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex justify-center mb-6"
                    >
                        <img src="/assets/images/logo.png" alt="NeuroLearn Logo" className="h-14 md:h-16" />
                    </motion.div>
                    <h1 className="text-4xl text-heading mb-3">Create Account</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Join our community of lifelong learners</p>
                </div>

                <Card className="p-8 md:p-12 border-slate-800 shadow-2xl" hover={false}>
                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="First Name"
                                name="first_name"
                                onChange={handleChange}
                                placeholder="Your first name"
                                required
                            />
                            <Input
                                label="Last Name"
                                name="last_name"
                                onChange={handleChange}
                                placeholder="Your last name"
                                required
                            />
                        </div>

                        <Input
                            label="Phone Number"
                            name="phone_number"
                            icon={User}
                            onChange={handleChange}
                            placeholder="Enter 10-digit phone number"
                            required
                            pattern="[0-9]{10}"
                            minLength="10"
                            maxLength="10"
                            title="Please enter exactly 10 digits"
                        />
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            icon={Mail}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            icon={Lock}
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            required
                        />
                        
                        <Button type="submit" className="w-full py-4 text-base mt-2" icon={UserPlus}>
                            Register Account
                        </Button>
                    </form>
                    
                    <p className="mt-10 text-center text-slate-400 font-medium text-sm">
                        Already have an account? 
                        <Link to="/login" className="ml-2 text-indigo-400 hover:text-indigo-300 transition-all font-bold underline underline-offset-4">
                            Log in here
                        </Link>
                    </p>
                </Card>
                
                <p className="mt-10 text-center text-slate-600 text-xs font-semibold tracking-wide">
                    &copy; 2026 NeuroLearn Platform
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
