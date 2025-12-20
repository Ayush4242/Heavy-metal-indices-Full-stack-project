import { user } from "./Userdata.jsx";   


export const getUserStats = () => {
  const { name, age, scores } = user;   

  
  const total = scores.reduce((sum, mark) => sum + mark, 0);
  const average = (total / scores.length).toFixed(2);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  return { name, age, average, highest, lowest };
};
