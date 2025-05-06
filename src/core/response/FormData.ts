import { IResponseBase, staticImplements } from '@types';

@staticImplements<IResponseBase>()
class FormDataResponse {
  // TODO: add application/x-www-form-urlencoded
  public static contentType = 'multipart/form-data';

  public static async parse(response: Response): Promise<FormData> {
    let result;
    try {
      result = await response.formData();
    } catch {
      result = new FormData();
    }
    return result;
  }

  // TODO: ann convert data: object -> FormData
  public static stringify(data: FormData): FormData {
    return data;
  }
}

export default FormDataResponse;
