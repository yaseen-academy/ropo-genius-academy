"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StudentsList({ students }) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState(null);

  async function handleRemove(studentId) {
    if (!confirm("Remove this student? This also cancels all their course enrollments.")) return;
    setRemovingId(studentId);
    try {
      await fetch(`/api/trainer/students/${studentId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  if (students.length === 0) {
    return <p className="text-sm text-muted">No students have enrolled yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead className="bg-panel2 text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Courses enrolled</th>
            <th className="px-4 py-2">Joined</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-t border-line">
              <td className="px-4 py-2.5">{s.name}</td>
              <td className="px-4 py-2.5 text-muted">{s.courseCount}</td>
              <td className="px-4 py-2.5 text-muted">
                {new Date(s.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-2.5 text-right">
                <button
                  onClick={() => handleRemove(s.id)}
                  disabled={removingId === s.id}
                  className="text-xs text-danger hover:underline disabled:opacity-50"
                >
                  {removingId === s.id ? "Removing…" : "Remove"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
