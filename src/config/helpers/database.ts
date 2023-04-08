/* eslint-disable @typescript-eslint/no-var-requires */
import { capitalize } from 'lodash';
import { DataSource } from 'typeorm';
import * as defaultConnection from '../database/connections/default';

export const dataSourceFor = (connectionName = 'default'): DataSource => {
  try {
    const res = require(`../database/connections/${connectionName}`);

    const connDataSource = (res.default || res) as DataSource;
    if (connDataSource) {
      if (!connDataSource.isInitialized) {
        connDataSource.initialize();
        return connDataSource;
      }

      return connDataSource;
    }

    return defaultConnection.default;
  } catch (err) {
    return defaultConnection.default;
  }
};

export const connectDataSourceFor = async (
  connectionName = 'default',
): Promise<DataSource | undefined> => {
  try {
    const res = require(`../database/connections/${connectionName}`);

    const connDataSource = (res.default || res) as DataSource;
    if (connDataSource) {
      if (!connDataSource.isInitialized) {
        await connDataSource.initialize();

        console.log(
          `${capitalize(connectionName)} Data Source Connected Succesfully`,
        );
        return connDataSource;
      }

      console.log(
        `${capitalize(connectionName)} Data Source Was Already Connected`,
      );
      return connDataSource;
    }

    throw `Could not connect to data source named ${connectionName}`;
  } catch (err) {
    console.error(
      `Error during ${capitalize(connectionName)} Data Source initialization`,
      err,
    );
    throw `Could not connect to data source named ${connectionName}`;
  }
};
