import {
  repository,
} from '@loopback/repository';
import {
  post,
  getModelSchemaRef,
  requestBody,
} from '@loopback/rest';
import { Issue } from '../models';
import { IssueRepository } from '../repositories';


export class IssueController {
  constructor(
    @repository(IssueRepository)
    public issueRepository: IssueRepository,
  ) { }

  @post('/issues', {
    responses: {
      '200': {
        description: 'Issue creado',
        content: { 'application/json': { schema: getModelSchemaRef(Issue) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Issue, {
            title: 'NewIssue',
            exclude: ['id'],
          }),
        },
      },
    })
    issue: Omit<Issue, 'id'>,
  ): Promise<{}> {
    await this.issueRepository.create(issue);
    return {
      statusCode: 200,
      response: 'El issue fue creado correctamente'
    }
  }
}
