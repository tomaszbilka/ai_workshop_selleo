import { useState } from "react";

export default function AIchat() {
  const [state, setState] = useState("");
  const handleSubmit = () => {
    console.log(state);
    fetch("http://localhost:3000", {
      method: "POST",
      body: JSON.stringify(state),
    }).then(() => console.log("sent: ", state));
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
