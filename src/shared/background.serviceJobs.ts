import { Inject, Injectable, Logger } from '@nestjs/common';
import { MailDataRequired, ClientResponse } from '@sendgrid/mail';
import { EmailPriority } from 'src/lib/enums';
import { DataSource, In } from 'typeorm';
import { Email } from './email.entity';
import { ContentTypes } from 'src/lib/types';
import axios from 'axios';
import { SharedService } from './shared.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BackgroundJobs {
  @Inject(DataSource)
  private dbSource: DataSource;

  @Inject()
  private sharedService: SharedService;

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendMails() {
    try {
      const dbManager = this.dbSource.manager;
      const emailJob = (await dbManager
        .createQueryBuilder(Email, 'email')
        .select(
          `
            case when 
                    exists(select * from email where priority = '${EmailPriority.IMMEDIATE}' and "email"."deletedAt" is null)
                then (select jsonb_agg(jsonb_build_object(
                    'id', "email"."id",
                    'emailOptions', "email"."emailOptions",
                    'attachmentFileUrls', "email"."attachmentFileUrls",
                    'priority', "email"."priority",
                    'sendAt', "email"."sendAt"
                )) from "email" "email" where "email"."priority" = '${EmailPriority.IMMEDIATE}'
                    and "email"."deletedAt" is null
                    limit 50
                    )
                when exists(select * from email where priority = '${EmailPriority.REGULAR}' and "email"."deletedAt" is null)
                then (select jsonb_agg(jsonb_build_object(
                    'id', "email"."id",
                    'emailOptions', "email"."emailOptions",
                    'attachmentFileUrls', "email"."attachmentFileUrls",
                    'priority', "email"."priority",
                    'sendAt', "email"."sendAt"
                )) 
                    from "email" "email" where "email"."priority" = '${EmailPriority.REGULAR}'
                    and "email"."deletedAt" is null
                    limit 50)
                when 
                    exists(
                            select * from email where priority = '${EmailPriority.DELAYED}' and "sendAt" is not null and now() >= "email"."sendAt"
                            and "email"."deletedAt" is null
                          )
                 then (select jsonb_agg(jsonb_build_object(
                        'id', "email"."id",
                        'emailOptions', "email"."emailOptions",
                        'attachmentFileUrls', "email"."attachmentFileUrls",
                        'priority', "email"."priority",
                        'sendAt', "email"."sendAt"
                    )) 
                    from "email" "email"
                    where "email"."priority" = '${EmailPriority.DELAYED}' and "email"."sendAt" is not null and now() >= "email"."sendAt"
                    and "email"."deletedAt" is null
                    limit 50
                    )
                else '[]' :: jsonb
            end
            `,
          'emails',
        )
        .where('email.deletedAt is null')
        .getRawOne()) as {
        emails: {
          id: string;
          emailOptions: MailDataRequired;
          attachmentFileUrls: {
            fileType: ContentTypes;
            fileName: string;
            url: string;
          }[];
          priority: EmailPriority;
          sendAt: null | Date;
        }[];
      };

      if (emailJob && emailJob.emails?.length) {
        // flatten emails to send
        const emails: MailDataRequired[] = await Promise.all(
          emailJob.emails.map(async (email) => {
            const fileAttachments: {
              content: string;
              type: ContentTypes;
              content_id: string;
              filename: string;
              disposition: string;
            }[] = [];
            if (email.attachmentFileUrls && email.attachmentFileUrls.length) {
              await Promise.all(
                email.attachmentFileUrls.map(async (fileAttachmentDetails) => {
                  const fileUrl = fileAttachmentDetails.url;
                  // *fetch wih axios and convert to base 64
                  const requestResponse = await axios.get(fileUrl);
                  if (requestResponse.status === 200) {
                    const fileBase64 = Buffer.from(
                      requestResponse.data,
                    ).toString('base64');

                    fileAttachments.push({
                      content: fileBase64,
                      type: fileAttachmentDetails.fileType,
                      filename: fileAttachmentDetails.fileName,
                      disposition: 'attachment',
                      content_id:
                        fileAttachmentDetails.fileName +
                        '_' +
                        fileAttachmentDetails.fileType,
                    });
                  }
                }),
              );
            }
            return {
              ...email.emailOptions,
              to: undefined,
              personalizations: [
                {
                  to: email.emailOptions.to,
                  custom_args: {
                    emailId: email.id,
                  },
                },
              ],
              ...(fileAttachments.length > 0
                ? { attachments: fileAttachments }
                : {}),
            };
          }),
        );

        type MailResponse = [
          (
            | {
                statusCode: number;
                body: string;
                headers: Record<string, unknown>;
              }
            | ClientResponse
          ),
          Record<string, unknown>,
        ][];

        const emailResponses: MailResponse = (await this.sharedService.sendMail(
          emails,
        )) as unknown as MailResponse;

        let index = 0;
        const emailIdsToDelete = [];
        for await (const response of emailResponses) {
          const email = emailJob.emails[index];
          /**
           ** Delete mail if sending succeeds
           */
          if (response[0]?.statusCode === 202) {
            emailIdsToDelete.push(email.id);
          }

          index++;
        }

        if (emailIdsToDelete.length > 0) {
          await dbManager.softDelete(Email, { id: In(emailIdsToDelete) });
        }
      }

      Logger.log('Email Job sender is exiting ...');
    } catch (error) {
      Logger.log(error);
    }
  }
}
