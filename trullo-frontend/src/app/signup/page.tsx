'use client'
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./styles.module.css";
import { API_BASE_URL } from "../config/api";

type SignUpForm = {
    name: string;
    email: string;
    password: string;
}

const signUp = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>();
    
    const onSubmit: SubmitHandler<SignUpForm> = async (data: SignUpForm) => {
        try{
            const response = await fetch(
                `${API_BASE_URL}/users/signup`,
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
                throw new Error("Failed to sign up");
            }
            
            const responseData = await response.json();
            console.log(responseData);
            
            // Redirect to signin after successful signup
            router.push("/signin");
        }catch(error){
         alert(`No connection to server, error ${error}`)
        }
    }

    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>Sign up to get started</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Name
              </label>
              <input 
                type="text" 
                id="name" 
                className={styles.input}
                placeholder="John Doe"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                })} 
              />
              {errors.name && (
                <span className={styles.error}>{errors.name.message}</span>
              )}
            </div>

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
              Sign up
            </button>
          </form>

          <p className={styles.signupLink}>
            Already have an account?{" "}
            <Link href="/signin" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
}

export default signUp