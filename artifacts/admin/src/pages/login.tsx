import { useEffect, useState } from "react";
import { Store, ShieldOff, Key, Eye, EyeOff } from "lucide-react";

const ADMIN_TOKEN = "abz_admin_tg_259875997";
const ADMIN_ID = "259875997";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("abz_admin_tg_token") === ADMIN_TOKEN) {
      onLogin();
    }
  }, [onLogin]);

  const handleLogin = () => {
    const val = code.trim();
    if (val === ADMIN_ID || val === ADMIN_TOKEN) {
      localStorage.setItem("abz_admin_tg_token", ADMIN_TOKEN);
      onLogin();
    } else {
      setError("Noto'g'ri admin kodi");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-violet-800 flex items-center justify-center p-4">
      <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Store className="w-9 h-9 text-white/80" />
          </div>
          <h1 className="font-display font-bold text-white text-2xl mb-1">ABZ Market</h1>
          <p className="text-white/50 text-sm">Admin Panel</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-white/70 text-xs font-semibold mb-2">Telegram ID</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={show ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Admin Telegram ID kiriting"
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>

          <button
            onClick={handleLogin}
            disabled={!code.trim()}
            className="w-full py-3 bg-white text-violet-900 font-display font-bold rounded-xl text-sm hover:bg-white/90 transition-all disabled:opacity-40"
          >
            Kirish
          </button>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-start gap-2 text-white/40 text-[11px]">
              <ShieldOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Faqat admin huquqiga ega Telegram ID bilan kirish mumkin: <span className="font-mono text-white/60">{ADMIN_ID}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
