import { AuthenticatedApiData } from './../lib/types';
import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { DataSource, Entity, EntityManager } from 'typeorm';
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
import { EmailPriority, TokenCreationPurpose } from 'src/lib/enums';
import { User } from 'src/auth/entities/User.entity';
import { Sign } from 'crypto';
import { Email } from 'src/shared/email.entity';

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
      project = await transactionManager.save(project);

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

  async generateApiTokenForApp(
    appId: string,
    appName: string,
    dbManager: EntityManager,
  ) {
    // create app token
    const appToken = new Token();
    appToken.appId = appId;
    appToken.purpose = TokenCreationPurpose.ACCESS_TOKEN;

    const appAccessTokenPayload = {
      appId,
      appName,
    };

    const apiAccessTokenExpiry = this.getApiAccessTokenExpiry();
    const appAccessToken = this.sharedService.signPayload(
      appAccessTokenPayload,
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

    // check if user exists by email
    let user = await dbManager.findOne(User, {
      where: { email: signUpUserDto.email },
    });

    await dbManager.transaction(async (transactionManager) => {
      // if user exists, associate user to app
      if (user) {
        const appUser = this.associateUserToApp(appId, user.id);
        appUser.password = await this.sharedService.hashPassword(
          signUpUserDto.password,
        );
        await transactionManager.save(appUser);
      } else {
        // if user does not exist, create user and associate user to app
        user = new User();
        Object.assign(user, signUpUserDto);
        // save user in db with transaction
        user = await transactionManager.save(user);

        // const appUser = this.associateUserToApp(appId, user.id);
        // appUser.password = await this.sharedService.hashPassword(
        //   signUpUserDto.password,
        // );
        // await transactionManager.save(appUser);

        await this.createAppUser(appId, user.id, transactionManager);

        // register verification email
        if (signUpUserDto.veriryEmail) {
          await this.registerVerificationEmail(
            appId,
            signUpUserDto.email,
            transactionManager,
          );
        }
      }
    });
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

    // check if user exists by email
    const user = await dbManager.findOne(User, {
      where: { email: signInUserDto.email },
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
    const isPasswordCorrect = await this.sharedService.comparePassword(
      signInUserDto.password,
      appUser.password,
    );

    if (!isPasswordCorrect) {
      throwForbidden('Password is incorrect');
    }

    // generate app token
    const appAccessToken = await this.generateApiTokenForApp(
      appId,
      app.name,
      dbManager,
    );

    return appAccessToken;
  }

  async createAppUser(
    appId: string,
    userId: string,
    transactionManager: EntityManager,
  ) {
    const dbManager = this.dbSource.manager;
    const appUser = this.associateUserToApp(appId, userId);
    appUser.password = await this.getDefaultUserPassword();
    await (transactionManager || dbManager).save(appUser);
  }

  async registerVerificationEmail(
    appId: string,
    userEmail: string,
    dbManager: EntityManager,
  ) {
    // generate token to send to user along with link
    const tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours
    const tokenString = this.sharedService.signPayload(
      { email: userEmail, appId, purpose: TokenCreationPurpose.SIGN_UP },
      '24h',
    );

    // abstract this to a method
    const token = this.createTokenObject(
      tokenString,
      TokenCreationPurpose.SIGN_UP,
      tokenExpiry,
    );
    token.appId = appId;

    // save token in db
    await dbManager.save(token);

    const serverUrl = this.configService.get('SERVER_URL');
    const tokenUrl = `${serverUrl}/v1/app/${appId}/verify-email?token=${tokenString}`;

    // send email to user with link using sendgrid service
    const mailSenderAccount = this.configService.get('MAIL_SENDER_ACCOUNT');
    const msg = {
      to: userEmail,
      from: mailSenderAccount,
      subject: 'Verify Email',
      html: `Kindly, click to verify your email. <a href="${tokenUrl}">Verify Email</a>`,
    };

    // save email in db to send later
    const email = new Email();
    email.body = msg;
    email.priority = EmailPriority.IMMEDIATE;

    await dbManager.save(email);

    // when user clicks link, verify token against token in db
  }

  // write method to respond to verify email link
  async verifyEmail(appId: string, token: string) {
    const dbManager = this.dbSource.manager;
    // check if token exists in db
    const tokenInDb = await dbManager.findOne(Token, {
      where: { appId, valueOfToken: token },
      relations: {
        app: true,
      },
    });

    if (!tokenInDb) {
      throwBadRequest('Invalid token');
    }

    // check if token is not expired
    const isTokenExpired = this.sharedService.isTokenExpired(
      tokenInDb.expiry,
      tokenInDb.createdAt,
    );

    if (isTokenExpired) {
      throwBadRequest('Token is expired');
    }

    // check if token is not used
    if (tokenInDb.isUsed) {
      throwBadRequest('Token is already used');
    }

    // check if token is for sign up
    if (tokenInDb.purpose !== TokenCreationPurpose.SIGN_UP) {
      throwBadRequest('Token is not for sign up');
    }

    // mark token as used
    tokenInDb.isUsed = true;
    await dbManager.save(tokenInDb);

    // associate user to app
    await this.createAppUser(appId, tokenInDb.userId, dbManager);
  }
}
