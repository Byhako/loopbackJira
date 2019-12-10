import {DefaultCrudRepository} from '@loopback/repository';
import {Issue, IssueRelations} from '../models';
import {DatabaseDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class IssueRepository extends DefaultCrudRepository<
  Issue,
  typeof Issue.prototype.id,
  IssueRelations
> {
  constructor(
    @inject('datasources.database') dataSource: DatabaseDataSource,
  ) {
    super(Issue, dataSource);
  }
}
