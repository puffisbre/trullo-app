'use client'
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./styles.module.css";
import { useLoginStore } from "../zustand/loginContext";
import { API_BASE_URL } from "../config/api";

type LoginForm = {
    email: string;
    password: string;
}

const signIn = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
    const { login } = useLoginStore();
    
    const onSubmit: SubmitHandler<LoginForm> = async (data: LoginForm) => {
        try{
            const response = await fetch(
                `${API_BASE_URL}/users/login`,
                {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to login" }));
                throw new Error(errorData.message || "Failed to login");
              }
              const userData = await response.json();
        
              const user = userData.user;
              if (!user?._id) {
                throw new Error("Invalid email or password");
              }
        
              // Save token to store and localStorage (for Safari compatibility)
              // Token is also sent as cookie, but Safari may block third-party cookies
              const token = userData.token;
              if (token) {
                login(token);
              } else {
                login('');
              }
        
              router.push("/dashboard");
        }catch(error){
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Login failed: ${errorMessage}`);
        }
    }

    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input 
                type="email" 
                id="email" 
                className={styles.input}
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })} 
              />
              {errors.email && (
                <span className={styles.error}>{errors.email.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input 
                id="password" 
                type="password" 
                className={styles.input}
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })} 
              />
              {errors.password && (
                <span className={styles.error}>{errors.password.message}</span>
              )}
            </div>

            <button type="submit" className={styles.submitButton}>
              Sign in
            </button>
          </form>

          <p className={styles.signupLink}>
            Don't have an account?{" "}
            <Link href="/signup" className={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    )
}

export default signIn