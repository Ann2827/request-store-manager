import Notifications from '../../src/modules/Notifications';
import Timer from '../../src/modules/Timer';

describe('Notifications class:', () => {
  let notifications: Notifications;

  beforeAll(() => {
    notifications = new Notifications({ timer: new Timer() });
  });

  beforeEach(() => {
    notifications.restart();
  });

  test('send', () => {
    notifications.send({ data: { text: 'Данные успешно получены.' }, type: 'success' });
    expect(notifications.state?.[0].data).toStrictEqual({ text: 'Данные успешно получены.' });
  });
});
