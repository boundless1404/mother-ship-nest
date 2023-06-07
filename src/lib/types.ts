export enum FileUploadExtensions {
  PDF = 'pdf',
  WORD_DOC = 'doc',
  WORD_DOCX = 'docx',
  IMAGE_PNG = 'png',
  IMAGE_JPG = 'jpg',
  IMAGE_JPGEG = 'jpeg',
  IMAGE_GIF = 'gif',
  IMAGE_WEBP = 'webp',
  VIDEO_MP4 = 'mp4',
  VIDEO_WEBM = 'webm',
  VIDEO_MKV = 'mkv',
  VIDEO_3GP = '3gp',
  VIDEO_AVI = 'avi',
  VIDEO_WMV = 'wmv',
  VIDEO_MOV = 'mov',
  VIDEO_M3U8 = 'm3u8',
  VIDEO_TS = 'ts',
  VIDEO_FLV = 'flv',
}

export enum ContentTypes {
  PDF = 'application/pdf',
  WORD_DOC = 'application/msword',
  WORD_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  IMAGE_PNG = 'image/png',
  IMAGE_JPG = 'image/jpeg',
  IMAGE_JPGEG = 'image/jpeg',
  IMAGE_GIF = 'image/gif',
  IMAGE_WEBP = 'image/webp',
  VIDEO_MP4 = 'video/mp4',
  VIDEO_WEBM = 'video/webm',
  VIDEO_MKV = 'video/x-matroska',
  VIDEO_3GP = 'video/3gpp',
  VIDEO_AVI = 'video/x-msvideo',
  VIDEO_WMV = 'video/x-ms-wmv',
  VIDEO_MOV = 'video/quicktime',
  VIDEO_M3U8 = 'application/x-mpegURL',
  VIDEO_TS = 'video/MP2T',
  VIDEO_FLV = 'video/x-flv',
}

export interface PlatformRequest extends Request {
  authPayload: AuthPayload;
}

export interface AuthPayload {
  userData: AuthenticatedUserData;
  profile?: unknown;
  apiData?: AuthenticatedApiData;
  exp?: number | unknown;
}

export interface AuthenticatedUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthenticatedApiData {
  appId: string;
  appName: string;
}
