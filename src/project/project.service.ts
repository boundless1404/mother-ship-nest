import {
  AuthPayload,
  AuthResponse,
  AuthenticatedApiData,
  AuthenticatedUserData,
} from './../lib/types';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Project } from './entities/Project.entity';
import { ProjectUser } from './entities/ProjectUser.entity';
import { CreateAppDto, CreateProjectDto } from './dto/dto';
import { throwBadRequest, throwForbidden } from 'src/utils/helpers';
import App from './entities/App.entity';
import AppUser from './entities/AppUser.entity';
import { ConfigService } from '@nestjs/config';
import { SharedService } from 'src/shared/shared.service';
import { AppUserSignInDto, AppUserSignUpDto } from './app-controller/dto/dto';
import { Token } from './entities/Token.entity';
import {
  AppVerificationPivot,
  AppVerificationType,
  EmailPriority,
  TokenCreationPurpose,
} from 'src/lib/enums';
import { User } from 'src/auth/entities/User.entity';
import { Email } from 'src/shared/email.entity';
import { ProjectAppConfiguration } from './entities/ProjectAppConfiguration.entity';
import { Sms } from './entities/Sms.entity';
import { isEmail } from 'class-validator';

@Injectable()
export class ProjectService {
  constructor(
    private dbSource: DataSource,
    private sharedService: SharedService,
    private configService: ConfigService,
  ) {
    //
  }

  // #region Private Methods
  private transferProjectData(createProjectDto: CreateProjectDto) {
    const project = new Project();
    Object.assign(project, createProjectDto);
    return project;
  }

  private createProjectUserPassword(userId: string, projectId: string) {
    const projectUser = new ProjectUser();
    projectUser.isAdmin = true;
    projectUser.userId = userId;
    projectUser.projectId = projectId;
    projectUser.isProjectCreator = true;
    return projectUser;
  }

  private async checkUserIsAdminOfProject(
    userId: string,
    projectId: string,
    dbManager: EntityManager,
  ) {
    //
    // validate if user is admin of the project
    const projectUser = await dbManager.findOne(ProjectUser, {
      where: { userId, projectId, isAdmin: true },
    });

    if (!projectUser) {
      throwBadRequest(
        'User is not admin of the project or project does not exist',
      );
    }
  }

  private async checkAppIsUniqueWithinProject(
    name: string,
    projectId: string,
    dbManager: EntityManager,
  ) {
    //
    // validate if app name is unique within the project
    const app = await dbManager.findOne(App, {
      where: { name, projectId },
    });

    if (app) {
      throwBadRequest('App name is already taken');
    }
  }

  private createApp(createAppDto: CreateAppDto, projectId: string) {
    const app = new App();
    app.name = createAppDto.name;
    app.projectId = projectId;
    !!createAppDto.requireIdentityValidation &&
      (app.requireIdentityValidation = createAppDto.requireIdentityValidation);
    return app;
  }

  private associateUserToApp(appId: string, userId: string) {
    const appUser = new AppUser();
    appUser.appId = appId;
    appUser.userId = userId;
    return appUser;
  }

  private async getDefaultUserPassword() {
    const defaultUserPassword = this.configService.get('DEFAULT_USER_PASSWORD');
    const passwordHash = await this.sharedService.hashPassword(
      defaultUserPassword,
    );
    return passwordHash;
  }

  private getApiAccessTokenExpiry() {
    const apiAccessTokenExpiry = this.configService.get(
      'API_ACCESS_TOKEN_EXPIRY',
    );

    return apiAccessTokenExpiry;
  }

  private createTokenObject(
    value: string,
    purpose: TokenCreationPurpose,
    tokenExpiry: number,
  ) {
    const token = new Token();
    token.valueOfToken = value;
    token.purpose = purpose;
    token.expiry = tokenExpiry;

    return token;
  }

  // #endregion

  async createProject(createProjectDto: CreateProjectDto, userId: string) {
    let project = this.transferProjectData(createProjectDto);

    await this.dbSource.transaction(async (transactionManager) => {
      project = await transactionManager.save(Project, project);

      const projectUser = this.createProjectUserPassword(userId, project.id);
      await transactionManager.save(projectUser);
    });
  }

  async createAppInProject(
    createAppDto: CreateAppDto,
    userId: string,
    projectId: string,
  ) {
    // refactor this to a separate method
    const dbManager = this.dbSource.manager;
    // validate if user is admin of the project
    await this.checkUserIsAdminOfProject(userId, projectId, dbManager);

    // validate if app name is unique within the project
    await this.checkAppIsUniqueWithinProject(
      createAppDto.name,
      projectId,
      dbManager,
    );

    let appAccessToken = '';
    await dbManager.transaction(async (transactionManager) => {
      // create app
      const newApp = this.createApp(createAppDto, projectId);
      await transactionManager.save(newApp);

      // associate user to app
      const appUser = this.associateUserToApp(newApp.id, userId);
      appUser.password = await this.getDefaultUserPassword();

      // generate app token
      appAccessToken = await this.generateApiTokenForApp(
        newApp.id,
        newApp.name,
        transactionManager,
      );

      // save app user
      await transactionManager.save(appUser);
    });

    return appAccessToken;
  }

  async grantAppAccessToUser(userId: string, projectId: string, appId: string) {
    // find the project user
    const dbManager = this.dbSource.manager;
    const projectUser = await dbManager.findOne(ProjectUser, {
      where: { projectId, userId },
    });

    if (!projectUser) {
      throwForbidden(
        'User is not admin of the project or project does not exist',
      );
    }

    // check app is in project
    const app = await dbManager.findOne(App, {
      where: { id: appId, projectId },
    });

    if (!app) {
      throwBadRequest('App does not exist in project');
    }

    // const apiData: AuthenticatedApiData = {
    //   appId,
    //   appName: app.name,
    // };

    // const authPayload: AuthPayload = {
    //   apiData,
    // };

    const apiAccessToken = this.generateApiTokenForApp(
      appId,
      app.name,
      dbManager,
    );
    return apiAccessToken;
  }

  async generateApiTokenForApp(
    appId: string,
    appName: string,
    dbManager: EntityManager,
  ) {
    // create app token
    const appToken = new Token();
    appToken.appId = appId;
    appToken.purpose = TokenCreationPurpose.ACCESS_TOKEN;

    const apiData = {
      appId,
      appName,
    };

    const authPayload: AuthPayload = {
      apiData,
    };

    const oneHourDefaultExpiry = 60 * 60 * 24 * 5000; // '5000d'
    const apiAccessTokenExpiry =
      parseInt(this.getApiAccessTokenExpiry()) || oneHourDefaultExpiry;

    const appAccessToken = this.sharedService.signPayload(
      authPayload,
      apiAccessTokenExpiry,
    );

    appToken.valueOfToken = appAccessToken;
    appToken.expiry = apiAccessTokenExpiry;
    await dbManager.save(appToken);

    return appAccessToken;
  }

  async signUserUpInApp(
    apiData: AuthenticatedApiData,
    signUpUserDto: AppUserSignUpDto,
  ) {
    const dbManager = this.dbSource.manager;
    // extract app id from apiData
    const { appId } = apiData;

    if (!appId) {
      throwForbidden('Invalid App access.');
    }
    // check if app exists
    const app = await dbManager.findOne(App, {
      where: { id: appId },
    });

    if (!app) {
      throwBadRequest('App does not exist');
    }

    const userEmail = signUpUserDto.email;
    const userPhone = signUpUserDto.phone;
    const userEmailIsValid = isEmail(userEmail || '');
    if (!userEmailIsValid || userPhone) {
      throwBadRequest('Either email or phone is required');
    }

    // check if user exists by email
    let user = await dbManager.findOne(User, {
      where: userEmailIsValid ? { email: userEmail } : { phone: userPhone },
    });

    await dbManager.transaction(async (transactionManager) => {
      // if user exists, associate user to app
      const password = signUpUserDto.password;
      if (!user) {
        // if user does not exist, create user and associate user to app
        user = transactionManager.create(User, signUpUserDto);
        // save user in db with transaction
        user = await transactionManager.save(user);
      }
      await this.createAppUser(appId, user.id, password, transactionManager);

      if (signUpUserDto.initiateVerificationRequest) {
        await this.registerVerificationRequest(appId, transactionManager, {
          userEmail,
          userPhone,
        });
      }
    });

    // * Remove password from user object

    return this.getAuthResponse({ user, isVerified: false });
  }

  getAuthResponse({
    user,
    isVerified,
  }: { user?: User; isVerified?: boolean } = {}) {
    return {
      ...(user
        ? this.sharedService.removeUnwantedFields<User>(user, [
            'createdAt',
            'updatedAt',
            'deletedAt',
          ])
        : {}),
      isVerified,
    } as AuthResponse;
  }

  async signUserInApp(
    apiData: AuthenticatedApiData,
    signInUserDto: AppUserSignInDto,
  ) {
    const dbManager = this.dbSource.manager;
    // extract app id from apiData
    const { appId } = apiData;

    if (!appId) {
      throwForbidden('Invalid App access.');
    }
    // check if app exists
    const app = await dbManager.findOne(App, {
      where: { id: appId },
    });

    if (!app) {
      throwBadRequest('App does not exist');
    }

    // check if user exists by email or phone
    const user = await dbManager.findOne(User, {
      where: signInUserDto.email
        ? { email: signInUserDto.email }
        : { phone: signInUserDto.phone },
    });

    if (!user) {
      throwForbidden('User does not exist');
    }

    // check if user is associated to app
    const appUser = await dbManager.findOne(AppUser, {
      where: { appId, userId: user.id },
    });

    if (!appUser) {
      throwForbidden('User is not associated to app');
    }

    // check if password is correct
    const passwordIsCorrect = await this.sharedService.comparePassword(
      signInUserDto.password,
      appUser.password,
    );

    if (!passwordIsCorrect) {
      throwForbidden('Password is incorrect');
    }

    // * Generate app token
    // * Consider adding configuration to check whether or not to generate token for user, this has to use a pre-configured secret for signing payload
    // const appAccessToken = await this.generateApiTokenForApp(
    //   appId,
    //   app.name,
    //   dbManager,
    // );

    return this.getAuthResponse({ user, isVerified: appUser.isVerified });
  }

  async createAppUser(
    appId: string,
    userId: string,
    password?: string,
    transactionManager?: EntityManager,
  ) {
    const dbManager = this.dbSource.manager;
    const appUser = this.associateUserToApp(appId, userId);
    appUser.password = password
      ? await this.sharedService.hashPassword(password)
      : await this.getDefaultUserPassword();
    await (transactionManager || dbManager).save(appUser);
  }

  async registerVerificationRequest(
    appId: string,
    dbManager: EntityManager,
    options: {
      userEmail?: string;
      userPhone?: string;
    },
  ) {
    // * Find user with provided email or phone
    const { userEmail, userPhone } = options;
    const userContactIsEmail = isEmail(userEmail);
    const user = await dbManager.findOne(User, {
      where: userContactIsEmail ? { email: userEmail } : { phone: userPhone },
      relations: {
        projectUsers: true,
      },
    });

    if (!user) {
      throwBadRequest('User does not exist');
    }

    // * Get the project Id to find the projectAppConfiguration
    const projectId = user.projectUsers.find(
      (projectUser) => projectUser.userId === user.id,
    ).projectId;

    // * Get the projectAppConfiguration
    const projectAppConfiguration = await dbManager.findOne(
      ProjectAppConfiguration,
      {
        where: { projectId, appId },
        relations: {
          app: true,
        },
      },
    );

    let useEmailForVerification = false;
    const appVerificationPivot = projectAppConfiguration.appVerificationPivot;
    if (
      (userContactIsEmail &&
        userPhone &&
        appVerificationPivot === AppVerificationPivot.EMAIL) ||
      userContactIsEmail
    ) {
      useEmailForVerification = true;
    }

    // get the appUser with the provided appId and userId
    const appUser = await dbManager.findOne(AppUser, {
      where: { appId, userId: user.id },
    });

    if (!appUser) {
      throwBadRequest('User is not associated to app');
    }

    const appUserId = appUser.id;

    // generate token to send to user along with link
    const tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours
    const verificationTokenCount =
      projectAppConfiguration.verificationTokenCount;
    // TODO: write function to generate token code based on verificationTokenCount
    const tokenCode = this.generateTokenCode(verificationTokenCount);

    // * Start transaction
    await dbManager.transaction(async (transactionManager) => {
      // abstract this to a method
      const token = this.createTokenObject(
        tokenCode,
        TokenCreationPurpose.SIGN_UP,
        tokenExpiry,
      );
      token.appId = appId;

      // save token in db
      await transactionManager.save(token);

      const app = projectAppConfiguration.app;
      const authhVerificationType = projectAppConfiguration.appVerificationType;
      const appAuthVerificationUrl =
        projectAppConfiguration.appAuthVerificationUrl;
      const serverUrl = this.configService.get('SERVER_URL');
      const apiBaseUrl = this.configService.get('API_BASE_URL') || '/v1/app';
      const tokenUrl = `${
        appAuthVerificationUrl
          ? `${appAuthVerificationUrl}`
          : `${serverUrl}${apiBaseUrl}/verify`
      }?token=${tokenCode}&appUserId=${appUserId}`;

      if (useEmailForVerification) {
        // send email to user with link using sendgrid service
        const mailSenderAccount = this.configService.get('MAIL_SENDER_ACCOUNT');
        const msg = {
          to: userEmail,
          from: mailSenderAccount,
          subject: 'Verify Email',
          html:
            authhVerificationType === AppVerificationType.CODE
              ? `Please use this code to verify completer your verification: ${token}`
              : `
        Kindly, click to verify your email. <a href="${tokenUrl}">Verify Email</a>. Or copy and paste this link in your browser ${tokenUrl}.
      `,
        };

        // save email in db to send later
        const email = new Email();
        email.body = msg;
        email.priority = EmailPriority.IMMEDIATE;

        await transactionManager.save(email);
      } else {
        // * Register sms content in db to send later
        const sms = new Sms();
        sms.to = user.phone;
        sms.content =
          authhVerificationType === AppVerificationType.CODE
            ? `Please use this code to verify completer your verification: ${token}`
            : `
              Kindly, click to verify your email ${tokenUrl}.
               Or copy and paste the link in your browser.
            `;
        sms.sender = app.name;

        await transactionManager.save(sms);
      }
    });
  }

  generateTokenCode(verificationTokenCount) {
    let tokenCode = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < verificationTokenCount; i++) {
      tokenCode += characters.charAt(
        Math.floor(Math.random() * charactersLength),
      );
    }
    return tokenCode;
  }

  // write method to respond to verify email link
  async completeAppUserVerification(
    apiData: AuthenticatedApiData,
    email: string,
    token: string,
    tokenPurpose: TokenCreationPurpose,
  ) {
    const appId = apiData.appId;
    const userEmail = email;
    const dbManager = this.dbSource.manager;
    // check if token exists in db
    const tokenInDb = await dbManager.findOne(Token, {
      // where: { appUserId, valueOfToken: token, purpose: tokenPurpose },
      where: {
        valueOfToken: token,
        purpose: tokenPurpose,
        appUser: {
          app: { id: appId },
          user: { email: userEmail },
        },
      },
      relations: {
        appUser: { user: true },
      },
    });

    if (!tokenInDb) {
      throwBadRequest('Invalid token or user');
    }

    // check if token is not expired
    const isTokenExpired = this.sharedService.isTokenExpired(
      tokenInDb.createdAt,
      {
        expiresInHHours: tokenInDb.expiry,
      },
    );

    if (isTokenExpired) {
      throwBadRequest('Token is expired');
    }

    const appUser = tokenInDb.appUser;
    await dbManager.transaction(async (transactionManager) => {
      // * Update appUser if token purpose is sign-up
      if (appUser && tokenPurpose === TokenCreationPurpose.SIGN_UP) {
        appUser.isVerified = true;
      }

      await transactionManager.save(appUser);

      //  * Delete token from db
      await dbManager.delete(Token, { id: tokenInDb.id });
    });

    return this.getAuthResponse({
      isVerified: appUser.isVerified,
    });
  }
}
