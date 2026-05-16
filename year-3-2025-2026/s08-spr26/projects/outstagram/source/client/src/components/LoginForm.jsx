import { useState } from "react";
import { supabase } from "../lib/supabase";
import LoginView from "./LoginView";

export default function LoginForm() {
    const [email, setEmail] = useState("demo1@outstagram.local");
    const [password, setPassword] = useState("12345678");
    const [err, setErr] = useState("");

    const onLogin = async (e) => {
        e.preventDefault();
        setErr("");

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setErr(error.message);

        // Login successful
        window.location.href = "/feed";
    };

    const onGoogleLogin = async () => {
        setErr("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) setErr(error.message);
    };

    return (
        <LoginView
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onLogin={onLogin}
            onGoogleLogin={onGoogleLogin}
            err={err}
        />
    );
}
