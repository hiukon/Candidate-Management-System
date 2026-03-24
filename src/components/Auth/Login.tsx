import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface LoginProps {
    onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen overflow-hidden">

            <div className="absolute inset-0 z-0">
                <img
                    src="/bg1.png"
                    alt="Background"
                    className="w-full h-full object-cover scale-105 animate-zoom"
                />
            </div>


            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-black/5 to-black/5 z-0"></div>


            <div className="relative z-10 container mx-auto px-4 h-screen flex items-center justify-end animate-fadeIn">
                <form
                    onSubmit={handleLogin}
                    className="backdrop-blur-md bg-white/20 p-8 rounded-2xl shadow-2xl w-[480px] flex flex-col items-center border border-white/40"
                >

                    <div className="mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-2 text-center text-white drop-shadow-md">
                        Chào mừng trở lại
                    </h1>
                    <p className="text-white/80 mb-8 text-center drop-shadow-sm">
                        Đăng nhập để tiếp tục quản lý ứng viên
                    </p>

                    <div className="w-full space-y-4">
                        <div>
                            <label className="text-sm text-white font-medium text-left block mb-2">
                                Địa chỉ email
                            </label>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-white font-medium text-left block mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>


                        <div className="text-right">
                            <button
                                type="button"
                                className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/30"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-white/70">Hoặc</span>
                            </div>
                        </div>

                        <p className="text-center text-white/80">
                            Chưa có tài khoản?{" "}
                            <button
                                type="button"
                                onClick={onSwitchToRegister}
                                className="text-blue-500 hover:text-red-500 hover:underline font-medium transition-colors"
                            >
                                Đăng ký ngay
                            </button>
                        </p>

                        {message && (
                            <p className="mt-4 text-red-300 text-center bg-red-900/40 px-3 py-2 rounded-lg backdrop-blur-sm">
                                {message}
                            </p>
                        )}
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes zoom {
                    from {
                        transform: scale(1);
                    }
                    to {
                        transform: scale(1.05);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
                .animate-zoom {
                    animation: zoom 10s ease-out infinite alternate;
                }
            `}</style>
        </div>
    );
};