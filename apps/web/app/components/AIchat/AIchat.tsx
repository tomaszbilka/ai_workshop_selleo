import { useState } from "react";

export default function AIchat() {
  const [state, setState] = useState("");
  const handleSubmit = async () => {
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
    <div className="w-full flex justify-center items-center p-5 gap-2">
      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="text-black"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
