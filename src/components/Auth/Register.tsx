import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface RegisterProps {
    onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Mật khẩu không khớp');
            return;
        }

        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
            setTimeout(() => {
                onSwitchToLogin();
            }, 3000);
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


            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/5 to-black/10 z-0"></div>
            <div className="relative z-10 container mx-auto px-4 h-screen flex items-center justify-end animate-fadeIn">
                <form
                    onSubmit={handleRegister}
                    className="backdrop-blur-md bg-white/20 p-8 rounded-2xl shadow-2xl w-[480px] flex flex-col items-center border border-white/40"
                >
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-2 text-center text-white drop-shadow-md">
                        Tạo tài khoản mới
                    </h1>
                    <p className="text-white/80 mb-8 text-center drop-shadow-sm">
                        Đăng ký để bắt đầu quản lý ứng viên
                    </p>

                    <div className="w-full space-y-4">
                        <div>
                            <label className="text-sm text-white font-medium text-left block mb-2">
                                Địa chỉ email
                            </label>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all backdrop-blur-sm"
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
                                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all backdrop-blur-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-white/50 mt-1 ml-1">Ít nhất 6 ký tự</p>
                        </div>

                        <div>
                            <label className="text-sm text-white font-medium text-left block mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all backdrop-blur-sm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
                                'Đăng ký'
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
                            Đã có tài khoản?{" "}
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="text-green-300 hover:text-green-200 hover:underline font-medium transition-colors"
                            >
                                Đăng nhập ngay
                            </button>
                        </p>

                        {message && (
                            <p className={`mt-4 text-center px-3 py-2 rounded-lg backdrop-blur-sm ${message.includes('thành công')
                                ? 'bg-green-900/40 text-green-300'
                                : 'bg-red-900/40 text-red-300'
                                }`}>
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