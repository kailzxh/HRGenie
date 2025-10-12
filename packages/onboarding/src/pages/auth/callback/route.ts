import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");

      if (!code) {
        navigate("/auth/login");
        return;
      }

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("OAuth exchange error:", error.message);
          navigate("/auth/login");
          return;
        }

        if (data.session) {
          console.log("Session established:", data.session);
          navigate("/dashboard");
        } else {
          navigate("/auth/login");
        }
      } catch (err) {
        console.error("Unexpected error during OAuth callback:", err);
        navigate("/auth/login");
      }
    };

    handleOAuthCallback();
  }, [location.search, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-4 text-slate-600">Completing sign-in...</p>
      </div>
    </div>
  );
}
