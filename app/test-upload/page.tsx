"use client";

import { useState } from "react";

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function uploadFile() {
    if (!file) {
      alert("Select a PPTX file first.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/ai/extract-document",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setResult(
          `ERROR: ${data.error || "Extraction failed"}`
        );
        return;
      }

      setResult(
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.error(error);

      setResult(
        "Something went wrong while uploading."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">

        <h1 className="text-2xl font-bold">
          PPTX Extraction Test
        </h1>

        <p className="mt-2 text-gray-600">
          Upload a PowerPoint file to test
          document extraction.
        </p>

        <input
          type="file"
          accept=".pptx"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] || null
            )
          }
          className="mt-6"
        />

        {file && (
          <p className="mt-3 text-sm text-gray-600">
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={uploadFile}
          disabled={!file || loading}
          className="mt-6 rounded-xl bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading
            ? "Extracting..."
            : "Extract PPTX"}
        </button>

        {result && (
          <pre className="mt-6 max-h-[500px] overflow-auto rounded-xl bg-gray-100 p-5 text-sm whitespace-pre-wrap">
            {result}
          </pre>
        )}

      </div>
    </main>
  );
}