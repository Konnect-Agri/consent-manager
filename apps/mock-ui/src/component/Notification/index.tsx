import { markFarmerChoice } from "../../api";
import styles from "./index.module.css";
import { useNotification } from "@magicbell/magicbell-react";

interface Props {
  data: any;
}

const NotificationItem: React.FC<Props> = (props) => {
  const { data } = props;
  const notification = useNotification(data);
  console.log("notification", notification, data);
  const submitResponse = async (choice: string) => {
    const url = `${data?.customAttributes?.collector?.url}/auth/${data?.customAttributes?.id}/${choice}`;
    const res = await markFarmerChoice(url).catch((err) => {
      console.log(err);
    });
    console.log(res);
    if (res) notification.markAsRead();
    else {
      notification.markAsRead();
    }
  };

  return (
    <div className={styles.container}>
      <p>{data.title}</p>
      <p>{data.content}</p>
      <div className={styles.btnContainer}>
        <div className={styles.btn} onClick={() => submitResponse("reject")}>
          Reject
        </div>
        <div className={styles.btn} onClick={() => submitResponse("accept")}>
          Accept
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
