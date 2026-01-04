export function getStoredUser() {
    try {
        const raw = localStorage.getItem("currentUser");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getRoleBasedPath(role) {
    const normalizedRole = role?.toLowerCase();

    switch (normalizedRole) {
        case "admin":
            return "/dashboard/admin";
        case "teacher":
            return "/dashboard/teacher";
        case "student":
            return "/dashboard/student";
        default:
            return "/auth/login";
    }
}

export function isAuthenticated() {
        return !!(localStorage.getItem("accessToken") && getStoredUser());
    }

    export function clearAuth() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
}
