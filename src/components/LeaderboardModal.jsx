import { useEffect, useState } from "react";
import axios from "axios";

const LeaderboardModal = ({ show, onClose, token }) => {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    if (show) {
      axios
        .get("http://localhost:5000/api/quiz/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setBoard(res.data));
    }
  }, [show, token]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">

        <h2 className="text-xl font-bold mb-4 text-center">
          Quiz Leaderboard
        </h2>

        <table className="w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Rank</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Score</th>
              <th className="border p-2">%</th>
            </tr>
          </thead>

          <tbody>
            {board.map((item, i) => (
              <tr key={i} className="text-center">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{item.user.name}</td>
                <td className="border p-2">{item.score}</td>
                <td className="border p-2">
                  {item.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={onClose}
          className="mt-6 bg-red-600 text-white px-6 py-2 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LeaderboardModal;
