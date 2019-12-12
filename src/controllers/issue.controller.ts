import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Issue } from '../models';
import { IssueRepository, ProyectoRepository } from '../repositories';


export class IssueController {
  constructor(
    @repository(IssueRepository)
    public issueRepository: IssueRepository,
    @repository(ProyectoRepository)
    public proyectoRepository: ProyectoRepository,
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
    const existProyect = await this.proyectoRepository.findOne({
      where: { id: issue.proyecto_id },
    });
    if (existProyect) {
      await this.issueRepository.create(issue);
      return {
        statusCode: 200,
        response: 'The issue was created correctly'
      }
    }
    return {
      statusCode: 403,
      response: 'The id proyect is incorect'
    }
  }

  @get('/issues', {
    responses: {
      '200': {
        description: 'List of issues',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Issue, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Issue)) filter?: Filter<Issue>,
  ): Promise<{}> {
    const listIssues = await this.issueRepository.find(filter);
    return {
      statusCode: 200,
      response: listIssues
    }
  }

  @get('/issues/{id}', {
    responses: {
      '200': {
        description: 'Usuario model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Issue, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Issue)) filter?: Filter<Issue>
  ): Promise<{}> {
    const exist = await this.issueRepository.findOne({
      where: { id },
    });
    if (exist) {
      const issue = await this.issueRepository.findById(id, filter);
      return {
        statusCode: 200,
        response: issue,
      }
    }
    return {
      statusCode: 403,
      response: 'The issue not exist',
    }
  }

  @put('/issues/{id}', {
    responses: {
      '204': {
        description: 'The issue is update',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() issue: Issue,
  ): Promise<{}> {
    const exist = await this.issueRepository.findOne({
      where: { id },
    });

    if (exist) {
      const existProyect = await this.proyectoRepository.findOne({
        where: { id: issue.proyecto_id },
      });
      if (existProyect) {
        await this.issueRepository.replaceById(id, issue);
        return {
          statusCode: 200,
          response: 'The user was edited correctly'
        }
      }
      return {
        statusCode: 403,
        response: 'The id proyect is incorect',
      }
    }
    return {
      statusCode: 403,
      response: 'This id of isssue is incorrect',
    }
  }
}
