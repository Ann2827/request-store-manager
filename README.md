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
- SettingsStore - инициализация конфига запросов
- LoaderStore - нужно подключить слушатель к своему компоненту Loader. При запросах будет запускаться автоматически (можно запретить автозапуск для отдельных запросов). Так же можно запускать вручную.
- MessagesStore - напишите сообщения для стандартных ошибок (404, 500,..). При использовании i18, вместо текстов положите ключи.
- NotificationStore - нужно подключить слушатель к своему компоненту Notifications. При запросах будет вызывать сообщения из MessagesStore (можно запретить автозапуск для отдельных запросов). Так же можно вызывать кастомные сообщения вручную.
- HttpsStore - выполняет запросы из SettingsStore конфига (можно выполнять неописанные запросы). Чаще используется для POST, PATCH, DELETE, PUT.
- NeedsStore - минималистичный запуск GET запросов с сохранением данных в хранилище и кэшированием.
- CacheStore - работает с localStorage, sessionStorage
- ScenariosStore - позволяет запускать действия после запроса. Например обновление данных или показ сообщения.
- TimerStore - просто таймер.


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
import type { IHttpsRequest } from 'library-react-hooks';

type TError = { message?: string[]; error?: string; statusCode?: number };

interface ITask {
  id: number;
  title: string;
}

declare module 'library-react-hooks' {
  /**
   * Задайте имя токена. В запросах вы будете указывать это имя. Если вы работаете с несколькими api,
   * то можно задать несколько имен.
   **/ 
  interface OverridableHttpsTokenNames {
    names: 'main' | 'second' | 'third';
  }
  /**
   * Опишите запросы
   * { <имя запроса>: [(<аргументы>) => IHttpsRequest, <успешный ответ>, <формат ошибки>] }
   **/ 
  interface OverridableHttpsRequestsConfig {
    postAuth: [(props: { email: string; password: string }) => IHttpsRequest, { token: string }, TError];
    getTasks: [() => IHttpsRequest, { tasks: ITask[]; total: number }, TError];
    deleteTask: [(id: number) => IHttpsRequest, object, TError];
    patchTask: [(id: number, task: Omit<ITask, 'id'>) => IHttpsRequest, ITask, TError];
    postTask: [(task: Omit<ITask, 'id'> & { password: string }) => IHttpsRequest, ITask, TError];   
  }
  /**
   * Задайте формат хранилища
   **/ 
  interface OverridableNeedsStoreConfig {
    tasks: ITask[] | null;
  }
  /**
   * Дополнительно
   * =================================================
   * Вы можете расширить передаваемые поля уведомления. По умолчанию Partial<Record<'title' | 'text' | 'action', string>>
   **/ 
  interface OverridableNotificationsSendData {
    action2: string;
  }
  /**
   * Вы можете расширить названия сценариев. По умолчанию используются имена запросов
   * Partial<Record<keyof OverridableHttpsRequestsConfig, void>>
   **/ 
  interface OverridableScenariosAfterRequests {
    myCustomName: void;
  }
}
```

3. Создайте конфиг и подключите его
*index.tsx*
```ts
import './api';
```

*api/index.ts*
```ts
import { HttpsStore, ICustomFetchCheckProps, NeedsStore, NotificationsStore, SettingsStore } from 'library-react-hooks';

import { GET_TASKS, POST_AUTH, POST_TASK } from './urls';
import { mockPosts, mockSuccessAnswer, mockTasks, mockUsers } from './mocks';

export * from './types';

function validationSuccessAnswer(dataJson: unknown, response: Response | undefined): dataJson is TAnswer<unknown> {
  return !!response?.ok && IsObject(dataJson);
}

SettingsStore.initialize({
  logger: !!import.meta.env.DEV,
  namedRequests: {
    // Сокращенный вариант записи. Без валидации, моков и т д
    postAuth: (props) => ({
      url: POST_AUTH,
      init: { method: 'POST' },
      body: props,
    }),
    // Полное описание запроса
    getTasks: {
      request: () => ({
        url: GET_TASKS, // обязательное поле
        init: { method: 'GET' },
        body: { ... },
        query: { ... },
        settings: { loader: false, messages: false },
        tokenName: 'main',
      }),
      validation: (dataJson, response): dataJson is { tasks: ITask[]; total: number } =>
        validationSuccessAnswer(dataJson, response) && IsTaskArray(dataJson.tasks) && ...,
      mock: { body: { tasks: [...mockTasks], total: 10 } },
      store: {
        key: 'tasks', // обязательное поле
        default: { backlog: [], done: [] }, // обязательное поле. значение по умолчанию
        // Что из body положить в хранилище
        composite: ({ state, dataJson }) => {
          return Object.groupBy(dataJson.tasks, ({ status }) => {
            switch (status) {
              case 'Backlog':
                return 'backlog';
              default:
                return 'done';
            }
          });
        },
        cache: { time: null, clean: { thisResponseIs: false }, place: 'sessionStorage' },
      },
    },
    postTask: {
      request: (task) => ({
        url: POST_TASK,
        init: { method: 'POST' },
        body: task,
        tokenName: 'main',
      }),
      validation: (dataJson, response): dataJson is ITask =>
        validationSuccessAnswer(dataJson, response) && IsTask(dataJson) && ...,
      // Альтернативный вариант. Подходит для запросов POST, PUT, PATCH. Когда в ответе должны оказаться отправленные данные.
      mock: ({ requestName, options, input }: ICustomFetchCheckProps) => {
        if (!options?.body) return;
        return new Response(JSON.stringify(options.body));
      },
      afterRequest: ({ response, input, valid }) => {
        if (!valid) return;
        NeedsStore.set('tasks', (prev: ITask[]) => [...prev, dataJson]);
        NotificationsStore.send({
          data: { text: 'Задача успешно добавлена' }, // or i18 key 'message.taskAdd'
          type: 'success',
          sticky: false,
        });
      },
    },
  },
  modules: {
    https: {
      settings: {
        mockMode: Boolean(import.meta.env.VITE_MOCK_MODE === 'true'), // Запускайте отдельной командой из packege.json
        waitToken: false, // Если токена еще нет, но запрос пошел, то сохранить запрос в очередь и запустить очередь после получения токена
        loader: true,
        messages: true,
        requestWithoutToken: true,
        mockDelay: 1, // in sec for mock mode
      },
      tokens: {
        main: {
          template: 'bearer', // 'bearer' = template "Authorization:Bearer ${token}"
          cache: {
            time: 60 * 24, // null - если у кэша нет срока годности | значение в секундах
            cleanWhenResponseIs: [401] // очистить, если response.ok = false | response.status = 401
          }
        },
        second: { template: 'x-auth:Bearer ${token}' }, // Example custom template
      },
    },
    needs: {
      settings: {
        loader: true,
        waitRequest: false // если запрос пошел до получения токена, то ждать токена и ответ | не ждать и сразу получить отрицательный ответ
      },
    },
    cache: {
      settings: {
        place: 'localStorage',
        prefix: 'admin--cache' // по умолчанию prefix = 'cache'
      },
    },
    messages: {
      codes: {
        '503;504': { // перечисление статусов через ";"
          title: 'Внутренняя ошибка сервера', // набор полей можно расширить в OverridableNotificationsSendData
          text: 'Попробуйте позже.',
        },
        402: {
          text: 'errors.error402',
          action: 'Перейти к оплате'
        },
        default: {
          title: 'Ошибка {{errorCode}}',
        },
        // Для ошибки 503 будет: { title: 'Внутренняя ошибка сервера', text: 'Попробуйте позже.' } 
        // Для ошибки 402 будет: { text: 'errors.error402', action: 'Перейти к оплате', title: 'Ошибка {{errorCode}}' } 
        // Для ошибки 400 будет: { title: 'Ошибка {{errorCode}}' }
      },
    },
    notifications: {
      settings: {
        duplicate: false, // разрешить дубликаты сообщений (по контенту). Помогает при излишнем перерендере
        sticky: true, // true - пользователь должен сам закрыть сообщение | false - закрыть по таймеру
        duration: 3 // время таймера в сек
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
import { LoaderStore } from 'library-react-hooks';

import { LoaderComponent, LoaderComponentProps } from 'src/components';

export const Loader: React.FC<LoaderComponentProps> = (props) => {
  const { active } = React.useSyncExternalStore(LoaderStore.on, LoaderStore.st); // react v >= 18
  // const active = LoaderStore.useSubscribe((state) => state.active) // react v < 18
  // const { active } = useLoader();

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
import { useNotifications } from 'library-react-hooks';
import { useTranslation } from 'react-i18next';
import { Alert, AlertTitle } from '@mui/material';

// For test notification view
// NotificationsStore.send({ data: { title: 'My title', text: 'Descr' } });

export const Notifications: React.FC = () => {
  const { notifications, drop } = useNotifications();
  const { t } = useTranslation();

  return (
    <div>
      {notifications.map(({ id, type, data, response, dataJson }) => (
        <Alert
          key={id}
          severity={type}
          onClose={() => {
            drop(id);
          }}
        >
          <AlertTitle>{t(data?.title || '', { errorCode: response?.status || '' })}</AlertTitle>
          {data?.text ? t(data.text) : null}
          {dataJson?.message?.toString() || null}
        </Alert>
      ))}
    </div>
  );
};
```

### Use <a name = "use"></a>
*auth.hook.ts*
```ts
import { HttpsStore, SettingsStore } from 'library-react-hooks';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  return {
    login: React.useCallback(
      async (props: { email: string; password: string }) => {
        const { dataJson, validation, response } = await HttpsStore.namedRequest('postAuth', props);
        if (validation?.(dataJson, response)) {
          HttpsStore.setToken('main', dataJson.token);
          navigate('/dashboard');
        }
      },
      [navigate],
    ),
    logout: React.useCallback(() => {
      SettingsStore.restart();
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
  const { store } = useNeeds(['tasks']); // GET укажите какие данные нужно подгрузить на этой странице

  const onAdd = React.useCallback(async (task: Omit<ITask, 'id'>) => {
    await HttpsStore.namedRequest('postTask', task); // POST, PUT, PATCH
    ScenariosStore.after('postTask'); // ответ можно обработать тут или вызвать сценарии
  }, []);

  const freeRequest = async () => {
    const { dataJson, response } = await HttpsStore.request('https://test.com/3', { body: { text: 'test' }, settings: { loader: true } });
    if (response?.ok && dataJson) {
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
