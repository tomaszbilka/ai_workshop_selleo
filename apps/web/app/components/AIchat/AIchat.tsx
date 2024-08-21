import { useState } from "react";

export default function AIchat() {
  const [state, setState] = useState(
    "Woda leci mi spod lodówki. Co mam zrobić?"
  );
  const handleSubmit = async () => {
    setState("");
    try {
      const response = await fetch("http://localhost:3000/aichat", {
        method: "POST",
        body: JSON.stringify({ query: state }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      console.log(json);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full flex justify-center items-center p-5">
      <div className="min-w-[400px] flex flex-col justify-center items-center p-5 gap-2">
        <label htmlFor="input">Your case:</label>
        <textarea
          id="input"
          rows={3}
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="text-black p-2 w-full"
        />
        <button
          className="rounded bg-blue-500 hover:bg-blue-300 px-8 py-1 "
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
