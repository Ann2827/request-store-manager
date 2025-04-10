class FormDataResponse {
  public static async parse(response: Response): Promise<FormData> {
    let result;
    try {
      result = await response.formData();
    } catch {
      result = new FormData();
    }
    return result;
  }

  public static contentType(): string {
    // TODO: add application/x-www-form-urlencoded
    return 'multipart/form-data';
  }
}

export default FormDataResponse;
