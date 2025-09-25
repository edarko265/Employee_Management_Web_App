// src/pages/auth/Unauthorized.tsx
export default function Unauthorized() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
        <a href="/login" className="text-blue-600 underline mt-4 block">Go to Login</a>
      </div>
    </div>
  );
}
