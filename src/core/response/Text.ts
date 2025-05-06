import { IResponseBase, staticImplements } from '@types';

@staticImplements<IResponseBase>()
class TextResponse {
  //TODO: add text/javascript text/css text/plain
  public static contentType = 'text/html';

  public static async parse(response: Response): Promise<string> {
    let result;
    try {
      result = await response.text();
    } catch {
      result = '';
    }
    return result;
  }

  public static stringify(data: string): string {
    return data;
  }
}

export default TextResponse;
