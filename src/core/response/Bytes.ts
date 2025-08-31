import { IResponseBase, staticImplements } from '@types';

@staticImplements<IResponseBase>()
class BytesResponse {
  public static contentType = '';

  public static async parse(response: Response): Promise<Uint8Array> {
    let result;
    try {
      result = await response.bytes();
    } catch {
      result = new Uint8Array();
    }
    return result;
  }

  // TODO: ann convert data: object -> Bytes
  public static stringify(data: Uint8Array): Uint8Array {
    return data;
  }
}

export default BytesResponse;
