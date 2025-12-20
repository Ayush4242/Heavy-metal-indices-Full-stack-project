import React from "react";
import { getUserStats } from "./UserStats.jsx";  

const UserComponent = () => {
  const { name, age, average, highest, lowest } = getUserStats(); 

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>User Statistics</h2>

      <p><b>Name:</b> {name}</p>
      <p><b>Age:</b> {age}</p>
      <p><b>Average Score:</b> {average}</p>
      <p><b>Highest Score:</b> {highest}</p>
      <p><b>Lowest Score:</b> {lowest}</p>
    </div>
  );
};

export default UserComponent;   
