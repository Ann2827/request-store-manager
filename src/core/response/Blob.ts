import { IResponseBase, staticImplements } from '@types';

@staticImplements<IResponseBase>()
class BlobResponse {
  public static contentType = '';

  public static async parse(response: Response): Promise<Blob> {
    let result;
    try {
      result = await response.blob();
    } catch {
      result = new Blob();
    }
    return result;
  }

  // TODO: ann convert data: object -> Blob
  public static stringify(data: Blob): Blob {
    return data;
  }
}

export default BlobResponse;
