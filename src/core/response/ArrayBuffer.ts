import { IResponseBase, staticImplements } from '@types';

@staticImplements<IResponseBase>()
class ArrayBufferResponse {
  public static contentType = '';

  public static async parse(response: Response): Promise<ArrayBuffer> {
    let result;
    try {
      result = await response.arrayBuffer();
    } catch {
      result = new ArrayBuffer();
    }
    return result;
  }

  // TODO: ann convert data: object -> ArrayBuffer
  public static stringify(data: ArrayBuffer): ArrayBuffer {
    return data;
  }
}

export default ArrayBufferResponse;
