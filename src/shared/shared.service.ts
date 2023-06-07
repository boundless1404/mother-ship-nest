import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import sendgridMail, { ClientResponse, MailDataRequired } from '@sendgrid/mail';
import { hash } from 'bcrypt';
import { MAIL_API_KEY } from 'src/config/envs';

@Injectable()
export class SharedService {
  constructor(private config: ConfigService, private jwtService: JwtService) {
    //
  }

  async hashPassword(data: string | Buffer) {
    const saltRounds = this.config.get('HASH_SALT_ROUNDS') || 10;
    const hashedPassword = await hash(data, saltRounds);
    return hashedPassword;
  }

  async veryfyJwtToken(token: string): Promise<Record<string, unknown>> {
    const payload = await this.jwtService.verify(token);
    return payload;
  }

  signPayload(
    payload: string | object | Buffer,
    expiresIn?: string | number,
  ): string {
    const token = this.jwtService.sign(payload, { expiresIn });
    return token;
  }

  async comparePassword(password: string, hashedPassword: string) {
    // hash password and compare with the one in the database
    const passwordHash = await this.hashPassword(password);
    const isPasswordCorrect = passwordHash === hashedPassword;
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
}
