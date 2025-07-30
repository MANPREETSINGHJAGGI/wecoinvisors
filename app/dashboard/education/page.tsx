"use client";

import Image from "next/image";
import Link from "next/link";

export default function EducationPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-12 py-12 bg-white text-gray-800">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">🎓 Education Platform</h1>
      <p className="text-center text-gray-600 max-w-xl mb-10">
        Explore concepts, questions, and solutions tailored for school students.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/dashboard/education/class1-5" className="bg-purple-100 p-6 rounded-lg shadow-md hover:shadow-lg transition block">
          <h2 className="text-xl font-semibold text-purple-800 mb-2">Class 1–5 Content</h2>
          <div className="flex items-center gap-2 mb-2">
            <Image src="/images/maya.png" alt="Maya" width={40} height={40} />
            <strong>Maya:</strong>
            <span>Fun, simple explanations for young learners.</span>
          </div>
          <p className="text-gray-700">Learning with Maya to build strong foundational concepts.</p>
        </Link>

        <Link href="/dashboard/education/class6-10" className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-lg transition block">
          <h2 className="text-xl font-semibold text-indigo-800 mb-2">Class 6–10 Content</h2>
          <div className="flex items-center gap-2 mb-2">
            <Image src="/images/aarya.png" alt="Aarya" width={40} height={40} />
            <strong>Aarya:</strong>
            <span>Clear and intelligent explanations.</span>
          </div>
          <p className="text-gray-700">Guided by Aarya for deeper understanding and exam prep.</p>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Homepage
        </Link>
      </div>
    </main>
  );
}
