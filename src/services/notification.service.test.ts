import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('send', () => {
    it('should create and return a notification', () => {
      const notif = service.send('r1', 'enrollment', 'Welcome', 'You have been enrolled');
      expect(notif.id).toBe('notif-1');
      expect(notif.recipientId).toBe('r1');
      expect(notif.type).toBe('enrollment');
      expect(notif.title).toBe('Welcome');
      expect(notif.message).toBe('You have been enrolled');
      expect(notif.read).toBe(false);
      expect(notif.createdAt).toBeInstanceOf(Date);
    });

    it('should increment IDs for each notification', () => {
      const n1 = service.send('r1', 'enrollment', 'T1', 'M1');
      const n2 = service.send('r1', 'completion', 'T2', 'M2');
      expect(n1.id).toBe('notif-1');
      expect(n2.id).toBe('notif-2');
    });

    it('should throw if recipientId is empty', () => {
      expect(() => service.send('', 'enrollment', 'T', 'M')).toThrow('Recipient ID is required');
    });

    it('should throw if title or message is empty', () => {
      expect(() => service.send('r1', 'enrollment', '', 'M')).toThrow('Title and message are required');
      expect(() => service.send('r1', 'enrollment', 'T', '')).toThrow('Title and message are required');
    });
  });

  describe('markAsRead', () => {
    it('should mark an unread notification as read', () => {
      const notif = service.send('r1', 'enrollment', 'T', 'M');
      const updated = service.markAsRead('r1', notif.id);
      expect(updated.read).toBe(true);
    });

    it('should throw if no notifications exist for recipient', () => {
      expect(() => service.markAsRead('unknown', 'notif-1')).toThrow('No notifications found for recipient');
    });

    it('should throw if notification not found', () => {
      service.send('r1', 'enrollment', 'T', 'M');
      expect(() => service.markAsRead('r1', 'notif-999')).toThrow('Notification not found');
    });

    it('should throw if notification is already read', () => {
      const notif = service.send('r1', 'enrollment', 'T', 'M');
      service.markAsRead('r1', notif.id);
      expect(() => service.markAsRead('r1', notif.id)).toThrow('Notification is already read');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read and return count', () => {
      service.send('r1', 'enrollment', 'T1', 'M1');
      service.send('r1', 'completion', 'T2', 'M2');
      const count = service.markAllAsRead('r1');
      expect(count).toBe(2);
      expect(service.getUnreadCount('r1')).toBe(0);
    });

    it('should return 0 for unknown recipient', () => {
      expect(service.markAllAsRead('unknown')).toBe(0);
    });

    it('should not count already-read notifications', () => {
      const n1 = service.send('r1', 'enrollment', 'T1', 'M1');
      service.send('r1', 'completion', 'T2', 'M2');
      service.markAsRead('r1', n1.id);
      const count = service.markAllAsRead('r1');
      expect(count).toBe(1);
    });
  });

  describe('getUnread', () => {
    it('should return only unread notifications', () => {
      const n1 = service.send('r1', 'enrollment', 'T1', 'M1');
      service.send('r1', 'completion', 'T2', 'M2');
      service.markAsRead('r1', n1.id);
      const unread = service.getUnread('r1');
      expect(unread).toHaveLength(1);
      expect(unread[0].title).toBe('T2');
    });

    it('should return empty array for unknown recipient', () => {
      expect(service.getUnread('unknown')).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('should return all notifications for a recipient', () => {
      service.send('r1', 'enrollment', 'T1', 'M1');
      service.send('r1', 'completion', 'T2', 'M2');
      expect(service.getAll('r1')).toHaveLength(2);
    });

    it('should return empty array for unknown recipient', () => {
      expect(service.getAll('unknown')).toEqual([]);
    });
  });

  describe('getByType', () => {
    it('should filter notifications by type', () => {
      service.send('r1', 'enrollment', 'T1', 'M1');
      service.send('r1', 'completion', 'T2', 'M2');
      service.send('r1', 'enrollment', 'T3', 'M3');
      const enrollmentNotifs = service.getByType('r1', 'enrollment');
      expect(enrollmentNotifs).toHaveLength(2);
    });

    it('should return empty for type with no notifications', () => {
      service.send('r1', 'enrollment', 'T1', 'M1');
      expect(service.getByType('r1', 'achievement')).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should remove a notification and return true', () => {
      const notif = service.send('r1', 'enrollment', 'T', 'M');
      expect(service.delete('r1', notif.id)).toBe(true);
      expect(service.getAll('r1')).toHaveLength(0);
    });

    it('should return false for unknown recipient', () => {
      expect(service.delete('unknown', 'notif-1')).toBe(false);
    });

    it('should return false for nonexistent notification', () => {
      service.send('r1', 'enrollment', 'T', 'M');
      expect(service.delete('r1', 'notif-999')).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should remove all notifications and return count', () => {
      service.send('r1', 'enrollment', 'T1', 'M1');
      service.send('r1', 'completion', 'T2', 'M2');
      expect(service.clearAll('r1')).toBe(2);
      expect(service.getAll('r1')).toEqual([]);
    });

    it('should return 0 for unknown recipient', () => {
      expect(service.clearAll('unknown')).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', () => {
      service.send('r1', 'enrollment', 'T1', 'M1');
      service.send('r1', 'completion', 'T2', 'M2');
      expect(service.getUnreadCount('r1')).toBe(2);
      service.markAsRead('r1', 'notif-1');
      expect(service.getUnreadCount('r1')).toBe(1);
    });

    it('should return 0 for unknown recipient', () => {
      expect(service.getUnreadCount('unknown')).toBe(0);
    });
  });
});
