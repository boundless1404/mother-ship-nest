import { DataSource } from 'typeorm';
import defaultConnectionOptions from '../../../../ormconfig';
import { Pool } from 'pg';
import { get, set } from 'lodash';
import { isMainThread } from 'worker_threads';
import waitUntil from 'until-promise';

const dataSourceConfig = defaultConnectionOptions;
if (!isMainThread) {
  set(dataSourceConfig, 'extra.max', 1);
}

const dataSource = new DataSource(dataSourceConfig);

let pool: Pool | undefined = undefined;
export const getPool = async () => {
  const poolRef: Pool = await waitUntil(
    () => {
      const poolRef = pool;
      if (!poolRef) {
        throw new Error('Oops.. Pool is not yet available');
      }

      return poolRef;
    },
    (resp) => !!resp,
    {
      wait: 300,
    },
  );

  return poolRef;
};

dataSource
  .initialize()
  .then(() => {
    pool = get(dataSource.driver, 'master') as Pool;
  })
  .catch((err) => {
    console.error('Error during Default Data Source initialization', err);
  });

export default dataSource;
