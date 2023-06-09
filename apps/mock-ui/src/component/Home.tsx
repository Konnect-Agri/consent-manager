import { useNotifications } from '@magicbell/magicbell-react';

import { MagicBellProvider } from '@magicbell/magicbell-react';
import EmptyState from './EmptyState';
import NotificationItem from "./Notification";
const Home = () => {
  const store: any = useNotifications();
  return (
    <MagicBellProvider apiKey={"3983ee94df2462f02d3f45913630ee1bc243df34"} userEmail={localStorage.getItem('userEmail') as string}>
      {
        store?.notifications?.filter((el: any) => el.readAt == null)?.length > 0
          ?
          <NotificationItem data={store.notifications.filter((el: any) => el.readAt == null)[0]} />
          :
          <EmptyState />
      }
    </MagicBellProvider>
  );
};

export default Home;
