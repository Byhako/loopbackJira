/* eslint-disable @typescript-eslint/camelcase */
import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
} from '@loopback/rest';
import { Proyecto } from '../models';
import { ProyectoRepository, IssueRepository, TiempoRepository, ProyectBody } from '../repositories';
import { ProyectSpec } from '../spec/proyecto.spec';

export class ProyectoController {
  constructor(
    @repository(ProyectoRepository)
    public proyectoRepository: ProyectoRepository,
    @repository(IssueRepository)
    public issueRepository: IssueRepository,
    @repository(TiempoRepository)
    public tiempoRepository: TiempoRepository,
  ) { }

  @post('/proyectos', {
    responses: {
      '200': {
        description: 'Proyecto model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Proyecto) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Proyecto, {
            title: 'NewProyecto',
            exclude: ['id'],
          }),
        },
      },
    })
    proyecto: Omit<Proyecto, 'id'>,
  ): Promise<{}> {
    const exist = await this.proyectoRepository.findOne({
      where: { key: proyecto.key }
    });
    if (exist) {
      return {
        statusCode: 403,
        response: 'Key incorrect. Use another'
      }
    }
    await this.proyectoRepository.create(proyecto);
    return {
      statusCode: 200,
      response: 'The project was created successfully.'
    }
  }

  @get('/proyectos', {
    responses: {
      '200': {
        description: 'Array of Proyecto model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Proyecto, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
  ): Promise<{}> {
    const listProyects = await this.proyectoRepository.find();
    return {
      statusCode: 200,
      response: listProyects
    }
  }

  @get('/proyectos/{id}', {
    responses: {
      '200': {
        description: 'Proyecto model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Proyecto, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
  ): Promise<{}> {
    const exist = await this.proyectoRepository.findOne({
      where: { id },
    });
    if (exist) {
      const proyect = await this.proyectoRepository.findById(id);
      return {
        statusCode: 200,
        response: proyect,
      }
    }
    return {
      statusCode: 403,
      response: 'The proyect not exist',
    }
  }

  @patch('/proyectos/{id}', {
    responses: {
      '204': {
        description: 'Proyecto PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody(ProyectSpec)
    proyectBody: ProyectBody
  ): Promise<{}> {
    const exist = await this.proyectoRepository.findOne({
      where: { id },
    });

    if (exist) {
      const proyecto = new Proyecto({ ...proyectBody });

      await this.proyectoRepository.updateById(id, proyecto);
      return {
        statusCode: 200,
        response: 'The project was edited correctly',
      }
    }
    return {
      statusCode: 403,
      response: 'The proyect not exist',
    }

  }

  @del('/proyectos/{id}', {
    responses: {
      '204': {
        description: 'Proyecto DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<{}> {
    const exist = await this.proyectoRepository.findOne({
      where: { id },
    });
    if (exist) {
      const issues = await this.issueRepository.find({
        where: { proyecto_id: id },
      });
      const issuesIds = issues.map(item => item.id ? item.id : 0).filter(item => !!item);

      const times = await this.tiempoRepository.find({
        where: {
          issue_id: {
            inq: issuesIds
          },
        },
      });
      const timesIds = times.map(item => item.id);

      // delete in tiempos
      await this.tiempoRepository.deleteAll({
        id: {
          inq: timesIds,
        },
      });

      // delete in issue
      await this.issueRepository.deleteAll({
        id: {
          inq: issuesIds,
        },
      });

      // delete in proyecto
      await this.proyectoRepository.deleteById(id);

      return {
        statusCode: 200,
        response: 'The proyect was successfully removed'
      }
    }
    return {
      statusCode: 403,
      response: 'The proyect not exist',
    }
  }
}
