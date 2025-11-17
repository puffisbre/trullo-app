'use client'
import { useRouter } from "next/navigation";
import { useLoginStore } from "../../zustand/loginContext";
import { API_BASE_URL } from "../../config/api";
import styles from "./styles.module.css";

const Logout = () => {
    const router = useRouter();
    const { logout } = useLoginStore();

    const handleLogout = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/users/logout`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to logout");
            }

            // Clear login state in zustand store
            logout();

            // Redirect to signin
            router.push("/signin");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Logout failed: ${errorMessage}`);
        }
    };

    return (
        <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
        </button>
    );
};

export default Logout;

