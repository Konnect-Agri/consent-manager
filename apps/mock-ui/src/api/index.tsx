import axios from "axios";

export const markFarmerChoice = async (url: string) => {
  const res = await axios.patch(
    url,
    {},
    {
      headers: {
        authorization: 'Bearer ' + localStorage.getItem("token"),
      },
    }
  );
  return res;
};
