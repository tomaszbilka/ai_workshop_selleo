import { useEffect, useState } from "react";

export default function AIchat() {
  const [state, setState] = useState(
    "Woda leci mi spod lodówki. Co mam zrobić?"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    response: string[];
    availability: string[];
  } | null>({ response: [], availability: [""] });

  const handleSubmit = async () => {
    setState("");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/aichat", {
        method: "POST",
        body: JSON.stringify({ query: state }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      setData(json);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center p-5">
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
          disabled={isLoading}
        >
          Submit
        </button>
      </div>
      {isLoading && <p className="text-white">Thinking...</p>}
      {data &&
        data?.response?.map((el: string) => (
          <p key={el} className="text-white">
            {el}
          </p>
        ))}
    </div>
  );
}
