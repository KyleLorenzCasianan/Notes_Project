import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const { user, login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({ userName: "", email: "", password: "" });
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to={location.state?.from || "/"} replace />;

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        try {
            if (isRegistering) {
                await register(form);
                toast.success("Account created");
            } else {
                await login({ email: form.email, password: form.password });
                toast.success("Welcome back");
            }
            navigate("/");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main data-theme="retro" className="flex min-h-screen items-center justify-center bg-base-200 px-5">
            <section className="w-full max-w-md rounded-box bg-base-100 p-8 shadow-xl sm:p-10">
                <div className="mb-8 text-center">
                    <p className="text-xl font-bold tracking-tight">Pixora</p>
                    <h1 className="mt-8 text-3xl font-semibold tracking-tight">
                        {isRegistering ? "Create your account" : "Welcome back"}
                    </h1>
                    <p className="mt-2 text-sm text-base-content/60">
                        {isRegistering ? "Start keeping your memories close." : "Sign in to your personal library."}
                    </p>
                </div>

                <form className="grid gap-4" onSubmit={submit}>
                    {isRegistering && (
                        <label className="form-control">
                            <span className="label-text mb-2 text-sm font-medium">Username</span>
                            <input className="input input-bordered w-full" name="userName" onChange={updateField} required type="text" value={form.userName} />
                        </label>
                    )}
                    <label className="form-control">
                        <span className="label-text mb-2 text-sm font-medium">Email</span>
                        <input className="input input-bordered w-full" name="email" onChange={updateField} required type="email" value={form.email} />
                    </label>
                    <label className="form-control">
                        <span className="label-text mb-2 text-sm font-medium">Password</span>
                        <input className="input input-bordered w-full" minLength={isRegistering ? 8 : undefined} name="password" onChange={updateField} required type="password" value={form.password} />
                    </label>
                    <button className="btn btn-primary mt-3 w-full" disabled={submitting} type="submit">
                        {submitting ? <span className="loading loading-spinner loading-sm" /> : isRegistering ? "Create account" : "Sign in"}
                    </button>
                </form>

                <button className="btn btn-ghost mt-5 w-full text-sm" onClick={() => setIsRegistering((current) => !current)} type="button">
                    {isRegistering ? "Already have an account? Sign in" : "Need an account? Create one"}
                </button>
            </section>
        </main>
    );
};

export default LoginPage;
