export interface IResponseBase {
  contentType: string;
  parse(response: Response): Promise<any>;
  stringify(data: any): BodyInit;
}
