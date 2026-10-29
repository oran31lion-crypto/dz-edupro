import { useState } from 'react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import Modal from './Modal';
import { saveUser, type User } from '@/lib/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuth: (user: User) => void;
}

export default function AuthModal({ open, onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('الرجاء إدخال الاسم الكامل.');
      return;
    }
    const user: User = {
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      isVip: false,
    };
    saveUser(user);
    onAuth(user);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
    >
      <div className="flex gap-2 mb-5 p-1 bg-navy-800/60 rounded-xl">
        <button
          onClick={() => {
            setMode('login');
            setError('');
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'login'
              ? 'bg-emerald-neon text-navy-950 shadow-neon-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          دخول
        </button>
        <button
          onClick={() => {
            setMode('signup');
            setError('');
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'signup'
              ? 'bg-emerald-neon text-navy-950 shadow-neon-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          حساب جديد
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <Field
            icon={<UserIcon size={18} />}
            placeholder="الاسم الكامل"
            value={name}
            onChange={setName}
            type="text"
          />
        )}
        <Field
          icon={<Mail size={18} />}
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={setEmail}
          type="email"
        />
        <div className="relative">
          <Field
            icon={<Lock size={18} />}
            placeholder="كلمة المرور"
            value={password}
            onChange={setPassword}
            type={show ? 'text' : 'password'}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-neon"
            aria-label="إظهار كلمة المرور"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-neon text-navy-950 font-bold py-3 rounded-xl hover:bg-emerald-bright transition-colors shadow-neon-sm hover:shadow-neon"
        >
          {mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
        </button>

        <p className="text-xs text-gray-500 text-center pt-2">
          هذه واجهة تجريبية — تُحفظ بياناتك محلياً في متصفحك فقط.
        </p>
      </form>
    </Modal>
  );
}

interface FieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}

function Field({ icon, placeholder, value, onChange, type }: FieldProps) {
  return (
    <div className="relative">
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-navy-800/60 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-neon/60 focus:ring-2 focus:ring-emerald-neon/20 transition-all"
      />
    </div>
  );
}
