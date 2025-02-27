import { ThreeDots } from "react-loader-spinner";

export const Loader = () => {
  return (
    <ThreeDots
      wrapperStyle={{ justifyContent: "center" }}
      height="100"
      width="100"
      color="#007586"
    />
  );
};
