import "./Button.css";
const Button = ({ text, color }) => {
  //text 변수의 값이 "로그인" true "로그인🍙" false text
  //   const cla= (color === undefined) ? ("") : (color)
  //   const text = "로그인" ? "로그인🍙" : text;

  return (
    <>
      <div className={`btn ${color === undefined ? "" : color}`}>{`${text === "로그인" ? text + "🍙" : text}`}</div>
      {text==="로그인" && <div>{text} 잡채호떡</div>}
      {text==="회원가입" && <div>{text} 먹고싶다</div>}
    </>
  );
};
export default Button;
