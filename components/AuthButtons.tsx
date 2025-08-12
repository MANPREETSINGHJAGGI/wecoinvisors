"use client";

export default function AuthButtons() {
  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      <button
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
