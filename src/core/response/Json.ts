import { IResponseBase, staticImplements } from '@types';

@staticImplements<IResponseBase>()
class JsonResponse {
  public static contentType = 'application/json';

  public static async parse(response: Response): Promise<number | boolean | object> {
    let result: number | boolean | object;
    try {
      result = await response.json();
    } catch {
      result = {};
      // console.error(e);
    }
    return result;
  }

  public static stringify(data: object): string {
    return JSON.stringify(data);
  }
}

export default JsonResponse;
