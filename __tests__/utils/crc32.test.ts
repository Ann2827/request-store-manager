import { crc32 } from '../../src/utils/crc32';

/**
 * @jest-environment node
 */
describe('crc32:', () => {
  test('1', () => {
    const str = 'my test string';
    const test1 = crc32(str);
    const test2 = crc32(str);
    expect(test1).toEqual(test2);
  });

  test('2', () => {
    const test1 = crc32('my test string 1');
    const test2 = crc32('my test string 2');
    expect(test1).not.toEqual(test2);
  });

  test('3', () => {
    expect(crc32('')).toEqual('ffffffff');
  });

  test('4', () => {
    expect(crc32('').length).toEqual(8);
    expect(crc32('1').length).toEqual(8);
    expect(crc32('my test string').length).toEqual(8);
  });
});
