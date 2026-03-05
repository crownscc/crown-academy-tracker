export type NotificationType = 'enrollment' | 'completion' | 'achievement' | 'reminder' | 'alert';

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private idCounter = 0;

  send(recipientId: string, type: NotificationType, title: string, message: string): Notification {
    if (!recipientId) {
      throw new Error('Recipient ID is required');
    }
    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    const notification: Notification = {
      id: `notif-${++this.idCounter}`,
      recipientId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    };

    const existing = this.notifications.get(recipientId) || [];
    existing.push(notification);
    this.notifications.set(recipientId, existing);

    return notification;
  }

  markAsRead(recipientId: string, notificationId: string): Notification {
    const notifications = this.notifications.get(recipientId);
    if (!notifications) {
      throw new Error('No notifications found for recipient');
    }

    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index === -1) {
      throw new Error('Notification not found');
    }

    if (notifications[index].read) {
      throw new Error('Notification is already read');
    }

    notifications[index] = { ...notifications[index], read: true };
    return notifications[index];
  }

  markAllAsRead(recipientId: string): number {
    const notifications = this.notifications.get(recipientId);
    if (!notifications) return 0;

    let count = 0;
    for (let i = 0; i < notifications.length; i++) {
      if (!notifications[i].read) {
        notifications[i] = { ...notifications[i], read: true };
        count++;
      }
    }
    return count;
  }

  getUnread(recipientId: string): Notification[] {
    const notifications = this.notifications.get(recipientId) || [];
    return notifications.filter((n) => !n.read);
  }

  getAll(recipientId: string): Notification[] {
    return this.notifications.get(recipientId) || [];
  }

  getByType(recipientId: string, type: NotificationType): Notification[] {
    const notifications = this.notifications.get(recipientId) || [];
    return notifications.filter((n) => n.type === type);
  }

  delete(recipientId: string, notificationId: string): boolean {
    const notifications = this.notifications.get(recipientId);
    if (!notifications) return false;

    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return false;

    notifications.splice(index, 1);
    return true;
  }

  clearAll(recipientId: string): number {
    const notifications = this.notifications.get(recipientId);
    if (!notifications) return 0;

    const count = notifications.length;
    this.notifications.delete(recipientId);
    return count;
  }

  getUnreadCount(recipientId: string): number {
    return this.getUnread(recipientId).length;
  }
}
