/*
  Purpose:
  Centralize all persistence logic related to push subscriptions.
*/

import database from "../../../database";
import {
  type StoredPushSubscription,
  StoredPushSubscriptionSchema,
  type SubscribeDTOWithUserId,
} from "./notificationSchemas";

class NotificationRepository {
  /*
    The endpoint identifies a browser: when someone else logs in on the same
    device, the subscription follows them.
  */
  upsert(subscription: SubscribeDTOWithUserId): void {
    database
      .prepare(
        `insert into push_subscription (user_id, endpoint, p256dh, auth)
         values (?, ?, ?, ?)
         on conflict(endpoint) do update set
           user_id = excluded.user_id,
           p256dh = excluded.p256dh,
           auth = excluded.auth`,
      )
      .run(
        subscription.user_id,
        subscription.endpoint,
        subscription.keys.p256dh,
        subscription.keys.auth,
      );
  }

  findByTroupe(
    troupeId: Troupe["id"],
    exceptUserId: User["id"],
  ): StoredPushSubscription[] {
    const rows = database
      .prepare(
        `select ps.*
         from push_subscription ps
         join troupe_member tm on tm.user_id = ps.user_id
         where tm.troupe_id = ? and ps.user_id != ?`,
      )
      .all(troupeId, exceptUserId);

    return rows.map((row) => StoredPushSubscriptionSchema.parse(row));
  }

  findAdmins(troupeId: Troupe["id"]): StoredPushSubscription[] {
    const rows = database
      .prepare(
        `select ps.*
         from push_subscription ps
         join troupe_member tm on tm.user_id = ps.user_id
         where tm.troupe_id = ? and tm.role = 'ADMIN'`,
      )
      .all(troupeId);

    return rows.map((row) => StoredPushSubscriptionSchema.parse(row));
  }

  findByUsers(userIds: User["id"][]): StoredPushSubscription[] {
    const rows = database
      .prepare(
        `select * from push_subscription
         where user_id in (select value from json_each(?))`,
      )
      .all(JSON.stringify(userIds));

    return rows.map((row) => StoredPushSubscriptionSchema.parse(row));
  }

  deleteForUser(endpoint: string, userId: User["id"]): void {
    database
      .prepare(
        "delete from push_subscription where endpoint = ? and user_id = ?",
      )
      .run(endpoint, userId);
  }

  deleteByEndpoint(endpoint: string): void {
    database
      .prepare("delete from push_subscription where endpoint = ?")
      .run(endpoint);
  }

  deleteByUser(userId: User["id"]): void {
    database
      .prepare("delete from push_subscription where user_id = ?")
      .run(userId);
  }
}

export default new NotificationRepository();
