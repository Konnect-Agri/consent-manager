import React, { useState } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";

const TrackingCard = (props: any) => {
  const [review, setReview] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  return (
    <div>
      <div>
        <h1> Loan Application Details </h1>
        <table>
          <tbody>
            <tr>
              <td> {props.loanApplication.order_id} </td>
              <td> {props.loanApplication.status} </td>
              <td> {props.loanApplication.review} </td>
              <td>
                <Link to={`/${props.loanApplication.order_id}`}>
                  <button> Review </button>
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <div>
          <label htmlFor="status"> status </label>
          <input
            type="text"
            id="status"
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="review"> Review </label>
          <input
            type="text"
            id="review"
            onChange={(e) => setReview(e.target.value)}
          />
        </div>
        <button
          type="submit"
          onClick={() => {
            Axios({
              method: "POST",
             //. url: `http://localhost:3004/applications/review/${props.loanApplication.order_id}`,
              url: `http://64.227.181.5:3010/applications/review/${props.loanApplication.order_id}`,
              // withCredentials: true,
              data: {
                review: review,
                status: status,
              },
            }).then((res) => alert(res.data));
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default TrackingCard;
