/* eslint-disable @typescript-eslint/camelcase */
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
import { Usuario } from '../models';
import { UsuarioRepository, TiempoRepository } from '../repositories';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(TiempoRepository)
    public tiempoRepository: TiempoRepository,
  ) { }

  @post('/usuarios', {
    responses: {
      '200': {
        description: 'Usuario creado correctamente',
        content: { 'application/json': { schema: getModelSchemaRef(Usuario) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<{}> {
    const username = usuario.username;
    const exist = await this.usuarioRepository.findOne({
      where: { username },
    });
    if (exist) {
      return {
        statusCode: 403,
        response: 'This username already exists',
      }
    } else {
      await this.usuarioRepository.create(usuario);
      return {
        statusCode: 200,
        response: 'The user was created successfully',
      }
    }
  }

  @get('/usuarios', {
    responses: {
      '200': {
        description: 'Lista de usuarios',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Usuario, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Usuario)) filter?: Filter<Usuario>,
  ): Promise<{}> {
    const listUsuarios = await this.usuarioRepository.find(filter);
    return {
      statusCode: 200,
      response: listUsuarios
    }
  }

  @get('/usuarios/{id}', {
    responses: {
      '200': {
        description: 'Usuario model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Usuario, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Usuario)) filter?: Filter<Usuario>
  ): Promise<{}> {
    const exist = await this.usuarioRepository.findOne({
      where: { id },
    });
    if (exist) {
      const user = await this.usuarioRepository.findById(id, filter);
      return {
        statusCode: 200,
        response: {
          username: user.username,
          nombre: user.nombre,
          apellido: user.apellido
        },
      }
    } else {
      return {
        statusCode: 403,
        response: 'The user not exist',
      }
    }
  }

  @put('/usuarios/{id}', {
    responses: {
      '204': {
        description: 'El usuario fue editado correctamente',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() usuario: Usuario,
  ): Promise<{}> {
    const username = usuario.username;
    const exist = await this.usuarioRepository.findOne({
      where: { username },
    });
    const own = await this.usuarioRepository.findOne({
      where: {
        and: [
          { username },
          { id }
        ]
      },
    });

    if (!exist) {
      await this.usuarioRepository.replaceById(id, usuario);
      return {
        statusCode: 200,
        response: 'The user was edited correctly'
      }
    } else {
      if (own) {
        await this.usuarioRepository.replaceById(id, usuario);
        return {
          statusCode: 200,
          response: 'The user was edited correctly'
        }
      } else {
        return {
          statusCode: 403,
          response: 'This username is incorrect',
        }
      }
    }
  }

  @del('/usuarios/{id}', {
    responses: {
      '204': {
        description: 'Usuario borrado correctamente',
      },
    },
  })
  async delete(@param.path.number('id') id: number): Promise<{}> {
    const exist = await this.usuarioRepository.findOne({
      where: { id },
    });
    if (exist) {
      const tiempos = await this.tiempoRepository.find({
        where: { usuario_id: id },
      });

      const tiempoIds = tiempos.map(item => item.id);

      await this.tiempoRepository.deleteAll({
        id: {
          inq: tiempoIds,
        },
      });

      await this.usuarioRepository.deleteById(id);

      return {
        statusCode: 200,
        response: 'The user was successfully removed'
      }
    } else {
      return {
        statusCode: 403,
        response: 'The user not exist',
      }
    }
  }
}
