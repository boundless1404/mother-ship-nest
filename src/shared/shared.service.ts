import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import sendgridMail, { ClientResponse, MailDataRequired } from '@sendgrid/mail';
import { compare, hash } from 'bcrypt';
// import { MAIL_API_KEY } from 'src/config/envs';
import { Sms } from 'src/project/entities/Sms.entity';
// import * as twilio from 'twilio';
import SibApiV3Sdk from '@getbrevo/brevo';
import {
  MTNSmsOptions,
  MTNSmsResponse,
  MTNRegisterCallbackUrlOptions,
  AuthPayload,
  ZeptoMail,
  TermiiSmsBody,
  TermiiSmsConfig,
} from 'src/lib/types';
import axios from 'axios';
import { SendMailClient } from 'zeptomail';

@Injectable()
export class SharedService {
  constructor(private config: ConfigService, private jwtService: JwtService) {
    //
  }

  async hashPassword(data: string | Buffer) {
    const saltRounds = Number(this.config.get('HASH_SALT_ROUNDS') || 10);
    const hashedPassword = await hash(data, saltRounds);
    return hashedPassword;
  }

  async veryfyJwtToken(token: string): Promise<Record<string, unknown>> {
    const payload = await this.jwtService.verify(token, {
      secret: this.config.get('JWT_SECRET'),
    });
    return payload;
  }

  signPayload(
    payload: string | Buffer | AuthPayload | Record<string, unknown>,
    expiresIn?: string | number,
    secret?: string,
  ): string {
    const token = this.jwtService.sign(payload, {
      expiresIn,
      secret: secret || this.config.get('JWT_SECRET'),
    });
    return token;
  }

  async comparePassword(password: string, hashedPassword: string) {
    // hash password and compare with the one in the database
    const isPasswordCorrect = await compare(password, hashedPassword);
    return isPasswordCorrect;
  }

  async sendMail(
    options: MailDataRequired | sendgridMail.MailDataRequired[],
    substitutionWrappers: [string, string] = ['{{', '}}'],
  ): Promise<[ClientResponse, Record<string, unknown>] | undefined> {
    try {
      let mailBodyIsMultiple: boolean | undefined;
      if (Array.isArray(options)) mailBodyIsMultiple = true;

      sendgridMail.setSubstitutionWrappers(...substitutionWrappers);

      const mailApiKey = this.config.get('MAIL_API_KEY');
      sendgridMail.setApiKey(mailApiKey);
      const mailResponse = await sendgridMail.send(options, mailBodyIsMultiple);
      return mailResponse;
    } catch (error) {
      Logger.error(error, 'emailService');
      return undefined;
    }
  }

  // async isTokenExpired(expiry: number, createdAt: Date) {
  //   const currentTime = Date.now();
  //   const timeDifference = currentTime - createdAt.getTime();
  //   const expiryTime = expiry * 60 * 60 * 1000; // convert hours to milliseconds
  //   if (timeDifference > expiryTime) {
  //     return true;
  //   }
  //   return false;
  // }

  async isTokenExpired(
    createdAt: Date,
    options: { expiresInHHours?: number; expiresInSeconds?: number },
  ) {
    const expiry = options.expiresInSeconds || options.expiresInHHours;
    const tokenExpirtyFactor = 1000 * 60 * options.expiresInHHours ? 60 : 1;
    const currentTime = Date.now();
    const timeDifferenceInMilliseconds = currentTime - createdAt.getTime();
    const expiryTime = expiry * tokenExpirtyFactor; // convert hours to milliseconds
    if (timeDifferenceInMilliseconds > expiryTime) {
      return true;
    }
    return false;
  }

  // * Implement sending sms with twilio
  async sendSms(sms: Sms) {
    //
    //Get account SID and auth token from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const sender = process.env.TWILIO_PHONE_NUMBER;

    // try {
    //   const message = await client.messages.create({
    //     body: sms.message,
    //     from: `+1${sms.from}`,
    //     to: `+1${sms.to}`
    //   });
    //   console.log(message.sid);
    // } catch (error) {
    //   console.log(error);
    // }
  }

  async sendSmsWithMtonApi(
    options: MTNSmsOptions,
  ): Promise<MTNSmsResponse | undefined> {
    try {
      // Ensure that the receiverAddress field is not empty
      if (!options.receiverAddress || options.receiverAddress.length === 0) {
        throw new Error('Receiver address is required');
      }

      // Ensure that the message and clientCorrelatorId fields are not longer than their respective maximum lengths
      if (options.message.length > 160) {
        throw new Error('Message cannot be longer than 160 characters');
      }
      if (options.clientCorrelatorId.length > 36) {
        throw new Error(
          'Client correlator ID cannot be longer than 36 characters',
        );
      }

      // Ensure that the serviceCode field is not empty
      if (!options.serviceCode) {
        throw new Error('Service code is required');
      }

      const response = await axios({
        method: 'POST',
        url: 'https://api.mtn.com/v3/sms/messages/sms/outbound',
        headers: {
          'Content-Type': 'application/json',
          Authorization: '',
        },
        data: options,
      });

      if (response.data) {
        return response.data as MTNSmsResponse;
      } else {
        return undefined;
      }
    } catch (error) {
      Logger.error(error, 'SMSService');
      return undefined;
    }
  }

  async registerCallbackUrl(
    options: MTNRegisterCallbackUrlOptions,
  ): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.mtn.com/v3/sms/messages/sms/subscription',
        {
          callbackUrl: options.callbackUrl,
          targetSystem: options.targetSystem,
          deliveryReportUrl: options.deliveryReportUrl,
          serviceCode: options.serviceCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            transactionId: '',
            Authorization: '',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to register callback URL: ${error.message}`);
    }
  }

  async sendBrevoEmail(brevoEmail: SibApiV3Sdk.SendSmtpEmail) {
    const brevoApiKey = this.config.get('BREVO_API_KEY');
    const brevoApiUrl = 'https://api.sendinblue.com/v3';
    const serverResponse = await axios.post(
      `${brevoApiUrl}/smtp/email`,
      brevoEmail,
      {
        headers: {
          'api-key': brevoApiKey,
        },
      },
    );

    try {
      const data = serverResponse.data;
      return data;
    } catch (error) {
      Logger.log(error);
    }
  }

  async sendZeptoEmail(zeptoEmail: ZeptoMail | ZeptoMail[]) {
    const url = 'zeptomail.zoho.com/';
    const token = this.config.get('ZEPETO_API_KEY');

    const client = new SendMailClient({ url, token });
    if (Array.isArray(zeptoEmail)) {
      await Promise.allSettled(
        zeptoEmail.map(async (mail) => await client.sendMail(mail)),
      );
    }

    const response = await client.sendMail(zeptoEmail);
    Logger.log(response);
  }

  async sendTermiiSms(termiiSms: TermiiSmsBody) {
    const termiiSmsConfig: TermiiSmsConfig = {
      api_key: this.config.get('TERMII_API_KEY'),
      from: this.config.get('TERMII_AUTH_SENDER_ID'),
      channel: 'generic',
      type: 'plain',
    };

    const url = `${this.config.get('TERMII_API_URL')}/sms/send`;
    const termiiServerResponse = await axios.post(
      url,
      { ...termiiSms, ...termiiSmsConfig },
      {
        headers: {
          'Content-Type': ['application/json', 'application/json'],
        },
      },
    );

    Logger.log(termiiServerResponse);
  }

  // async sendBrevoBactchedEmail(email: string, templateId: number) {
  //   const brevoApiKey = this.config.get('BREVO_API_KEY');
  //   // const brevoApiUrl = 'https://api.brevo.com/v1';

  //   const defaultClient = SibApiV3Sdk.ApiClient.instance;

  //   // Configure API key authorization: api-key
  //   const apiKey = defaultClient.authentications['api-key'];
  //   apiKey.apiKey = brevoApiKey;

  //   // Configure API key authorization: partner-key
  //   const partnerKey = defaultClient.authentications['partner-key'];
  //   partnerKey.apiKey = brevoApiKey;

  //   const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  //   const batchSend = new SibApiV3Sdk.SendSmtpEmail();
  //   batchSend.to = [{ email: email }];
  //   batchSend.templateId = templateId;
  //   batchSend.sender = { name: 'Sender Name', email: 'ender@example.com' };
  //   batchSend.subject = 'Test email';
  //   batchSend.params = {
  //     // Add your template variables here
  //     variable1: 'value1',
  //     variable2: 'value2',
  //   };

  //   try {
  //     const data = await apiInstance.sendTransacEmail(batchSend);
  //     console.log('API call successful. Returned data: ', JSON.stringify(data));
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  removeUnwantedFields<T>(data: T, fields: (keyof T)[]) {
    const dataCopy = { ...data };
    fields.forEach((field) => {
      delete dataCopy[field];
    });
    return dataCopy as Omit<T, (typeof fields)[number]>;
  }
}
