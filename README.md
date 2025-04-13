# request-store-manager

[![NPM](https://img.shields.io/npm/v/request-store-manager.svg)](https://www.npmjs.com/package/request-store-manager)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)

Позволяет писать меньше шаблонного кода при запросах к api.

## Table of Contents

- [request-store-manager](#request-store-manager)
  - [Table of Contents](#table-of-contents)
  - [Motivation ](#motivation-)
  - [Features ](#features-)
  - [✨ Demo ](#-demo-)
  - [Getting Started ](#getting-started-)
  - [🚀 Usage ](#-usage-)
    - [Settings config ](#settings-config-)
    - [Connect Loader component ](#connect-loader-component-)
    - [Connect Notifications component ](#connect-notifications-component-)
    - [Use ](#use-)
  - [🤝 Contributing ](#-contributing-)
  - [📝 License ](#-license-)
  - [Contact ](#contact-)

## Motivation <a name = "motivation"></a>
При создании нового фронтового приложения каждый раз приходится организовывать работу связки:
- Запрос/отправка данных по api
- Запускаем loader
- Получаем ответ. Валидируем полученные данные.
- Останавливаем loader
- Показываем сообщение (успех/ошибка)
- Приводим полученные данные в нужный формат и сохраняем в хранилище
- Кэшируем.

Часто разработка фронта и бэка происходит в асинхронном формате. Фронтовое приложение хочется иметь возможность разрабатывать/запускать не зависимо от серверной части. Но добавление моков на все приложение занимает не мало времени.

Так же, данные запрашиваются из разных мест. А хотелось бы собрать все запросы в одном файле. И при вызове запроса писать как можно меньше однообразного кода.

Данная библиотека позволяет:
- описать полный конфиг запросов в одном месте
- подключить слушатели хранилища к своим компонентам: Loader, Notifications
- вызывать запросы в пару строк
- запускать mock mode, кэшировать данные, обращаться к хранилищу. Есть возможность подключить сообщения к i18 и описать стандартные ошибки

## Features <a name = "features"></a>
- Loader - нужно подключить слушатель к своему компоненту Loader. При запросах будет запускаться автоматически (можно запретить автозапуск для отдельных запросов). Так же можно запускать вручную.
- Messages - напишите сообщения для стандартных ошибок (404, 500,..). При использовании i18, вместо текстов положите ключи.
- Notifications - нужно подключить слушатель к своему компоненту Notifications. При запросах будет вызывать сообщения из MessagesStore (можно запретить автозапуск для отдельных запросов). Так же можно вызывать кастомные сообщения вручную.
- Https - выполняет запросы из конфига (можно выполнять неописанные запросы). Чаще используется для POST, PATCH, DELETE, PUT.
- Needs - минималистичный запуск GET запросов с сохранением данных в хранилище и кэшированием.
- Cache - работает с localStorage, sessionStorage.
- CacheStrict - обрабатывает только значения по заданным ключам.
- Timer - просто таймер.
- Request - выполняет fetch запросы и mock запросы.
- Token - хранилище токенов.
- Store - хранилище ответов из Needs. Можно создавать самостоятельные хранилища.


## ✨ Demo <a name = "demo"></a>

<!-- [Demo](https://ann2827.github.io/library-react-hooks/) -->

[Example admin](https://github.com/Ann2827/demo-admin)

## Getting Started <a name = "getting_started"></a>

```sh
npm install --save request-store-manager
```

## 🚀 Usage <a name = "usage"></a>

### Settings config <a name = "settings_config"></a>

1. Создайте папку `src/api`
  - `src/api`
    - index.ts
    - mocks.ts
    - types.ts
    - urls.ts
2. Опишите типы
*api/types.ts*
```ts
import type { RequestManagerBase, IHttpsRequest, TNotificationsBase } from 'request-store-manager';

type TError = { message?: string[]; error?: string; statusCode?: number };

interface ITask {
  id: number;
  title: string;
}

/**
  * Задайте имя токена. В запросах вы будете указывать это имя. Если вы работаете с несколькими api,
  * то можно задать несколько имен.
**/ 
type TTokens = 'main' | 'second' | 'third';

/**
 * Задайте формат хранилища
**/ 
type TStore = {
  tasks: { backlog: string[]; done: string[] };
  zero: boolean;
  non: null;
}

/**
  * Опишите запросы (для GET можно добавить storeKey для автосохранения), типы успешных ответов
**/ 
interface RM extends RequestManagerBase<TTokens, TStore> {
  getTasks: {
    fn: (quantity: number) => IHttpsRequest<TTokens>;
    success: { data: { type: 'backlog' | 'done'; text: string }[]; quantity: number };
    storeKey: 'tasks';
    error: TError;
  };
  getZero: {
    fn: () => IHttpsRequest<TTokens>;
    success: boolean;
    storeKey: 'zero';
  };
  postAuth: {
    fn: () => IHttpsRequest<TTokens>;
    success: boolean;
  };
}

/**
  * Дополнительно
  * =================================================
  * Вы можете расширить передаваемые поля уведомления. По умолчанию Partial<Record<'title' | 'text' | 'action', string>>
**/ 
interface TNotifications extends TNotificationsBase {
  action2: string;
}

```

3. Создайте конфиг и подключите его
*index.tsx*
```ts
import './api';
```

*api/index.ts*
```ts
import { HttpsStore, ICustomFetchCheckProps, NeedsStore, NotificationsStore, SettingsStore } from 'request-store-manager';

import { GET_TASKS, POST_AUTH, POST_TASK } from './urls';
import { mockPosts, mockSuccessAnswer, mockTasks, mockUsers } from './mocks';

export * from './types';

function validationSuccessAnswer(dataJson: unknown, response: Response | undefined): dataJson is TAnswer<unknown> {
  return !!response?.ok && IsObject(dataJson);
}

requestManager = new RequestManager<TTokens, TStore, RM>({
      settings: {
        logger: false,
        notifications: {},
        cache: { prefix: 'test' },
        request: { mockMode: true },
        https: {
          waitToken: false,
          notifications: false,
          loader: false,
        },
      },
      tokens: {
        main: {
          template: 'bearer',
          cache: {
            maxAge: 60 * 24,
          },
        },
      },
      namedRequests: {
        getTasks: {
          request: (quantity: number) => ({
            url: 'https://test.com/' + quantity,
            method: 'GET',
            tokenName: 'main',
          }),
          validation: (dataJson, response): dataJson is RM['getTasks']['success'] =>
            !!response?.ok && typeof dataJson === 'object',
          mock: (input, init) => {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            const quantity = Number(url.split('/').reverse()[0]);
            return new Response(
              JSON.stringify({
                data: [
                  { type: 'backlog', text: 'task1' },
                  { type: 'done', text: 'tsak2' },
                ],
                quantity,
              }),
              {
                status: 200,
                statusText: 'OK',
              },
            );
          },
          store: {
            key: 'tasks',
            default: { backlog: [], done: [] },
            converter: ({ state, validData }) => {
              const { backlog, done } = Object.groupBy(validData.data, ({ type }) => type);
              return { backlog: backlog?.map(({ text }) => text) || [], done: done?.map(({ text }) => text) || [] };
            },
            validation: (data): data is Store[RM['getTasks']['storeKey']] =>
              !!data && typeof data === 'object' && 'backlog' in data && 'done' in data,
            cache: { maxAge: 0, place: 'sessionStorage' },
            empty: (value) => value.backlog.length === 0 && value.done.length === 0,
          },
          afterRequest: ({ response, input }) => {
            if (!response.ok) return;
            requestManager
              .getModule('notifications')
              .send({ data: { text: 'Данные успешно получены.' }, type: 'success' });
          },
        },
        getZero: {
          request: () => ({
            url: 'https://test.com/',
            method: 'GET',
            tokenName: 'main',
          }),
          store: {
            key: 'zero',
            default: false,
          },
        },
        postAuth: () => ({
          url: 'https://test.com/',
          method: 'GET',
          tokenName: 'main',
        }),
      },
      messages: {
        codes: {
          403: {
            title: 'errors.error403',
          },
          default: {
            title: 'errors.errorTitle',
          },
        },
      },
});
```

### Connect Loader component <a name = "connect_loader"></a>
*App.tsx*
```tsx
import * as React from 'react';
import { useRoutes } from 'react-router-dom';

import { routes } from 'src/navigation/routes';
import { Loader, Notifications } from 'src/modules';

export const App: React.FC = () => {
  const page = useRoutes(routes);
  return (
    <div>
      <Loader />
      <Notifications />
      {page}
    </div>
  );
};
```

*Loader.tsx*
```tsx
import * as React from 'react';
import requestManager from '../api';

import { LoaderComponent, LoaderComponentProps } from 'src/components';

export const Loader: React.FC<LoaderComponentProps> = (props) => {
  const { active } = React.useSyncExternalStore(requestManager.connectLoader.subscribe, requestManager.connectLoader.state); // react v >= 18

  if (!active) return null;

  return <LoaderComponent {...props} active={active} />;
};
```

### Connect Notifications component <a name = "connect_notifications"></a>
*App.tsx*
```tsx
import * as React from 'react';
import { useRoutes } from 'react-router-dom';

import { routes } from 'src/navigation/routes';
import { Loader, Notifications } from 'src/modules';

export const App: React.FC = () => {
  const page = useRoutes(routes);
  return (
    <div>
      <Loader />
      <Notifications />
      {page}
    </div>
  );
};
```

*Notifications.tsx*
```tsx
import * as React from 'react';
import requestManager from '../api';
import { useTranslation } from 'react-i18next';
import { Alert, AlertTitle } from '@mui/material';

// For test notification view
// requestManager.sendNotification({ data: { title: 'My title', text: 'Descr' } });

export const Notifications: React.FC = () => {
  const notifications = React.useSyncExternalStore(requestManager.connectNotifications.subscribe, requestManager.connectNotifications.state); // react v >= 18
  const { t } = useTranslation();

  return (
    <div>
      {notifications.map(({ id, type, data, response, drop }) => (
        <Alert
          key={id}
          severity={type}
          onClose={() => {
            drop(id);
          }}
        >
          <AlertTitle>{t(data?.title || '', { errorCode: response?.status || '' })}</AlertTitle>
          {data?.text ? t(data.text) : null}
        </Alert>
      ))}
    </div>
  );
};
```

### Use <a name = "use"></a>
*auth.hook.ts*
```ts
import requestManager from '../api';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  return {
    login: React.useCallback(
      async (props: { email: string; password: string }) => {
        const { validData } = await requestManager.namedRequest('postAuth', props);
        if (validData) {
          requestManager.setToken('main', validData.token);
          navigate('/dashboard');
        }
      },
      [navigate],
    ),
    logout: React.useCallback(() => {
      requestManager.restart();
      navigate('/');
    }, [navigate]),
  };
};

```

*LoginPage.tsx*
```tsx
import * as React from 'react';
import { useAuth } from 'src/hooks';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={() => { login({ email, password }) }}>Login</button>
    </div>
  );
};
```

*TasksPage.tsx*
```tsx
import { HttpsStore, ScenariosStore, useNeeds } from 'library-react-hooks';
import * as React from 'react';

import { ITask } from 'src/types';

export const TasksPage: React.FC = () => {
  const { tasks } = React.useSyncExternalStore(requestManager.subscribe, requestManager.state); // react v >= 18
  React.useEffect(() => {
    requestManager.needAction('tasks', NeedsActionTypes.request, 1);
  }, []);
  const { store } = useNeeds(['tasks']); // GET укажите какие данные нужно подгрузить на этой странице

  const onAdd = React.useCallback(async (task: Omit<ITask, 'id'>) => {
    await requestManager.namedRequest('postTask', task); // POST, PUT, PATCH
    // ответ можно обработать тут или в afterRequest
  }, []);

  const freeRequest = async () => {
    const { dataJson, response } = await requestManager.getModule('request').fetch('https://test.com/3');
    if (response?.ok) {
      // do something
    } else {}
  };

  return (
    <div>
      <h1>Tasks Page</h1>
      <ul>
        {store?.tasks?.map(({ id, title }) => (
          <div key={id}>{title}</div>
        ))}
      </ul>
      <button onClick={() => { onAdd({ title: 'new task' }) }}>Add task</button>
    </div>
  );
};
```

## 🤝 Contributing <a name = "contributing"></a>

Contributions, issues and feature requests are welcome.
[Check the contributing guide](./CONTRIBUTING.md).

## 📝 License <a name = "license"></a>

Copyright © 2025 [Bystrova Ann](https://github.com/Ann2827).<br />
This project is [MIT](https://github.com/Ann2827/library-react-hooks/blob/main/LICENSE) licensed.

## Contact <a name = "contact"></a>

Bystrova Ann - ann.bystrova96@mail.ru
