import { useState } from "react";
import Button from "./Button";
const Card = () => {
  const [on, setOn] = useState(false);
  return (
    <>
      <h1 onClick={()=> setOn((prev)=>!prev)}>{on ? "🌞" : "🌙"}</h1>
      {/* {on이 true일때만 보이게} */}
      {/* ! 단항연산자 */}
      {/* &&,|| 이항연산자 */}
      {/* a>b:c 삼항연산자 */}
      {on === true ? "🌞": "" }
      <Button text="클릭" />
      <div style={{color:on&&"red"}}>Card</div>
    </>
  );
};
export default Card;
