import { User } from 'src/auth/entities/User.entity';

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
  userData?: AuthenticatedUserData;
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

// * Remove unwanted fields from User entity
export type AuthResponse = Omit<
  User,
  'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  isVerified: boolean;
};

export interface BrevoSmtpEmail {
  to: { email: string }[];
  templateId?: number;
  htmlContent?: string;
  sender: { name: string; email: string };
  subject: string;
  params?: { [key: string]: string };
  attachment?: { url?: string; name?: string; content?: string }[];
}

export interface MTNSmsOptions {
  /**
   * The sender address to use for the message. If this is provided, it will take precedence over the serviceCode.
   * @type {string}
   */
  senderAddress?: string;

  /**
   * The array of receiver addresses for the message.
   * @type {string[]}
   * @required
   */
  receiverAddress: string[];

  /**
   * The message to send.
   * @type {string}
   * @required
   */
  message: string;

  /**
   * The client correlator ID for the message.
   * @type {string}
   * @required
   */
  clientCorrelatorId: string;

  /**
   * The keyword to use for the message.
   * @type {string}
   */
  keyword?: string;

  /**
   * The service code to use for the message.
   * @type {string}
   * @required
   */
  serviceCode: string;

  /**
   * Whether to request a delivery report for the message. Default is false.
   * @type {boolean}
   */
  requestDeliveryReceipt?: boolean;
}

export interface MTNSmsResponse {
  /**
   * The MADAPI Canonical Error Code (it is 4 characters long and it is not the HTTP Status Code which is 3 characters long). Back-end system errors are mapped to specific canonical error codes which are returned. More information on these mappings can be found on the MADAPI Confluence Page 'Response Codes'.
   * @type {string}
   * @required
   */
  statusCode: string;

  /**
   * More details and corrective actions related to the error which can be shown to a client.
   * @type {string}
   * @required
   */
  statusMessage: string;

  /**
   * MADAPI generated Id to include for tracing requests.
   * @type {string}
   * @required
   */
  transactionId: string;

  /**
   * The status of the submitted outbound message(s).
   * @type {string}
   * @required
   */
  data: {
    status: string;
  };
}

export interface MTNRegisterCallbackUrlOptions {
  callbackUrl: string;
  targetSystem: string;
  deliveryReportUrl: string;
  serviceCode: string;
}
