import ArrayBufferResponse from './ArrayBuffer';
import BlobResponse from './Blob';
import BytesResponse from './Bytes';
import FormDataResponse from './FormData';
import JsonResponse from './Json';
import TextResponse from './Text';

export type TResponseFormat = 'json' | 'text' | 'formData' | 'bytes' | 'blob' | 'arrayBuffer';

/**
 * Организовыват работу с разными форматами данных при запросах.
 */
class ResponseFactory {
  public static async parse(format: TResponseFormat, response: Response) {
    switch (format) {
      case 'text': {
        return TextResponse.parse(response);
      }
      case 'formData': {
        return FormDataResponse.parse(response);
      }
      case 'bytes': {
        return BytesResponse.parse(response);
      }
      case 'blob': {
        return BlobResponse.parse(response);
      }
      case 'arrayBuffer': {
        return ArrayBufferResponse.parse(response);
      }
      default: {
        return JsonResponse.parse(response);
      }
    }
  }

  public static requestContentType(format: TResponseFormat) {
    switch (format) {
      case 'text': {
        return TextResponse.contentType();
      }
      case 'formData': {
        return FormDataResponse.contentType();
      }
      case 'bytes': {
        return BytesResponse.contentType();
      }
      case 'blob': {
        return BlobResponse.contentType();
      }
      case 'arrayBuffer': {
        return ArrayBufferResponse.contentType();
      }
      default: {
        return JsonResponse.contentType();
      }
    }
  }
}

export default ResponseFactory;
