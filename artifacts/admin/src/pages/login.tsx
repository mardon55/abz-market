import { useEffect } from "react";
import { Store, ShieldOff } from "lucide-react";

const ADMIN_TOKEN = "abz_admin_tg_6271849608";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  useEffect(() => {
    if (localStorage.getItem("abz_admin_tg_token") === ADMIN_TOKEN) {
      onLogin();
    }
  }, [onLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-violet-800 flex items-center justify-center p-4">
      <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative text-center">
        <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <ShieldOff className="w-9 h-9 text-white/60" />
        </div>
        <h1 className="font-display font-bold text-white text-2xl mb-2">Ruxsat yo'q</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          Bu sahifaga faqat Telegram orqali kirishingiz mumkin.<br />
          ABZ Market mini ilovani oching va Admin Panel tugmasini bosing.
        </p>
        <div className="bg-white/10 border border-white/15 rounded-2xl px-5 py-4 text-white/40 text-xs">
          <Store className="w-5 h-5 mx-auto mb-2 text-white/30" />
          Admin huquqi: Telegram ID <span className="font-mono text-white/60">6271849608</span>
        </div>
      </div>
    </div>
  );
}
