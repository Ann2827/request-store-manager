import { getDiff } from '../../src/utils/diff';

describe('utils diff: fn:', () => {
  test('should be return simple diff', () => {
    expect(getDiff(null, null)).toEqual([]);
    expect(getDiff(null, true)).toEqual([['null', 'true']]);
    expect(getDiff(['test'], null)).toEqual([['["test"]', 'null']]);
    expect(getDiff('test', 'key')).toEqual([['test', 'key']]);
    expect(getDiff({ a: '1' }, null)).toEqual([[JSON.stringify({ a: '1' }), 'null']]);
  });

  test('should be return diff for obj', () => {
    expect(getDiff({ a: '1' }, { a: '2' })).toEqual([['a:1', 'a:2']]);
    expect(getDiff({ a: '1' }, { a: null })).toEqual([['a:1', 'a:null']]);
    expect(getDiff({ a: '1' }, { a: '1', b: '1' })).toEqual([['b:', 'b:1']]);
    expect(getDiff({ a: '1' }, { b: '1' })).toEqual([
      ['a:1', 'a:'],
      ['b:', 'b:1'],
    ]);
    expect(getDiff({ a: { b: '1' } }, { a: { b: '2' } })).toEqual([['a.b:1', 'a.b:2']]);
  });

  test('should be return diff for obj functions', () => {
    expect(getDiff({ a: {} }, { a: { f: () => true } })).toEqual([['a.f:', 'a.f:"() => true"']]);
    expect(
      getDiff(
        { a: {} },
        {
          a: {
            f() {
              return false;
            },
          },
        },
      ),
    ).toEqual([['a.f:', 'a.f:"f() {return false;}"']]);
  });

  test('should be return diff for hard obj', () => {
    expect(getDiff({ profile: null }, { profile: { email: 'test@mail.ru' } })).toEqual([
      ['profile:null', 'profile:{"email":"test@mail.ru"}'],
    ]);
  });

  test('should be return diff for hard obj and array', () => {
    const obj1 = {
      tasks: {
        archived: [],
        backlog: [{ description: 'aliquip', id: 40_987_683, status: 'Backlog', title: 'irure' }],
        done: [],
        inProgress: [],
        ready: [],
      },
      users: null,
      profile: { email: 'test@mail.ru' },
      posts: [
        {
          id: 78_223_062,
          authorId: 36_289_081,
          title: 'cillum irure voluptate',
          body: 'laboris consectetur cupidatat aliqua',
        },
        { id: -86_501_790, authorId: -95_983_968, title: 'dolor nulla Lorem dolore', body: 'aliqua cupidatat enim' },
        { id: 59_374_932, authorId: -65_329_758, title: 'sint in', body: 'ex velit in amet id' },
        { id: -83_205_524, authorId: 73_569_258, title: 'cupidatat voluptate ut et ad', body: 'anim' },
      ],
    };
    const obj2 = {
      ...obj1,
      tasks: {
        ...obj1.tasks,
        backlog: [...obj1.tasks.backlog, { description: 'aliquip', id: 40_987, status: 'Backlog', title: 'irure' }],
      },
    };
    const diff = getDiff(obj1, obj2);

    expect(diff.length).toEqual(1);
    expect(diff).toEqual([
      [
        'tasks.backlog:[{"description":"aliquip","id":40987683,"status":"Backlog","title":"irure"}]',
        'tasks.backlog:[{"description":"aliquip","id":40987683,"status":"Backlog","title":"irure"},{"description":"aliquip","id":40987,"status":"Backlog","title":"irure"}]',
      ],
    ]);
  });
});
