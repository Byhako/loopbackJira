/* eslint-disable @typescript-eslint/camelcase */
import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
} from '@loopback/rest';
import { Tiempo, Usuario } from '../models';
import moment from 'moment-with-locales-es6';

import { TiempoRepository, UsuarioRepository, ProyectoRepository, IssueRepository } from '../repositories';

export class TiempoController {
  constructor(
    @repository(TiempoRepository)
    public tiempoRepository: TiempoRepository,
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(IssueRepository)
    public issueRepository: IssueRepository,
    @repository(ProyectoRepository)
    public proyectoRepository: ProyectoRepository,
  ) { }


  @get('/tiempos/{usuario_id}/{fecha_inicio}/{fecha_fin}', {
    responses: {
      '200': {
        description: 'Array of Tiempo model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              // items: getModelSchemaRef(Tiempo, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async findProyects(
    @param.path.number('usuario_id') usuario_id: number,
    @param.path.string('fecha_inicio') fecha_inicio: string,
    @param.path.string('fecha_fin') fecha_fin: string,
    // @param.query.object('filter', getFilterSchemaFor(Tiempo)) filter?: Filter<Tiempo>,
  ): Promise<{}> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuario_id },
    });

    if (usuario) {
      const fechaInicio = moment.utc(fecha_inicio);
      const fechaFin = moment.utc(fecha_fin);

      // time of every user
      const users = await this.tiempoRepository.find({
        where: {
          and: [
            { usuario_id },
            { fecha: { gte: fechaInicio } },
            { fecha: { lte: fechaFin } }
          ]
        },
      });

      let tiempoTotal = moment('00:00:00', "HH:mm:ss");
      const detalleLogs = users.map(item => {
        const horaIni = moment(item.hora_inicio, "HH:mm:ss");
        const horaFin = moment(item.hora_fin, "HH:mm:ss");

        const diff = horaFin.diff(horaIni);
        tiempoTotal = tiempoTotal + diff;
        return {
          horas_trabajadas: moment.utc(diff).format("HH:mm"),
          issue_id: item.issue_id
        }
      })
      tiempoTotal = moment(tiempoTotal).format("HH:mm");

      // I group the times of each issue
      const detalleLogsSum: any[] = [];
      const issuesIds: number[] = [];
      detalleLogs.forEach(item => {
        const issue = item.issue_id;
        const indexIssue = issuesIds.indexOf(issue);
        if (indexIssue === -1) {
          detalleLogsSum.push(item)
          issuesIds.push(issue);
        } else {
          let indexDetail = 0;
          let time = '';
          detalleLogsSum.forEach((el, idx) => {
            if (el.issue_id === issue) {
              indexDetail = idx;
              time = el.horas_trabajadas
            }
          })
          time = moment(time, "HH:mm") + moment.utc(item.horas_trabajadas, "HH:mm")
          time = moment(time).format("HH:mm");
          detalleLogsSum.splice(indexDetail, 1)
          detalleLogsSum.push({ horas_trabajadas: time, issue_id: issue })
        }
      })

      const issuesList = await this.issueRepository.find({
        where: {
          id: {
            inq: issuesIds
          },
        },
      });
      const proyectosIds = issuesList.map(item => item.proyecto_id)

      detalleLogsSum.forEach((item, idx) => {
        const issueId = item.issue_id;
        issuesList.forEach(is => {
          if (issueId === is.id) {
            detalleLogsSum[idx].proyecto_id = is.proyecto_id;
          }
        })
      })

      const proyectosList = await this.proyectoRepository.find({
        where: {
          id: {
            inq: proyectosIds
          },
        },
      });

      const proyectos = detalleLogsSum.map(item => {
        const proyectId = item.proyecto_id;
        let proyecItem = {};
        proyectosList.forEach(pl => {
          if (proyectId === pl.id) {
            proyecItem = { horas_trabajadas: item.horas_trabajadas, nombre_proyecto: pl.nombre };
          }
        })
        return proyecItem;
      })

      return {
        statusCode: 200,
        response: {
          user: usuario.nombre,
          tiempo_total: tiempoTotal,
          proyectos,
        }
      };
    }
    return {
      statusCode: 403,
      response: 'The user not exist',
    }
  }

  @get('/tiempos/{fecha_inicio}/{fecha_fin}', {
    responses: {
      '200': {
        description: 'tiempo total por usuario',
        content: {
          'application/json': {
            schema: {
              type: 'array',
            },
          },
        },
      },
    },
  })
  async findTiempor(
    @param.path.string('fecha_inicio') fecha_inicio: string,
    @param.path.string('fecha_fin') fecha_fin: string,
    @param.query.object('filter', getFilterSchemaFor(Usuario)) filter?: Filter<Usuario>,
  ): Promise<{}> {
    const fechaInicio = moment.utc(fecha_inicio).format("YYYY:MM:DD");
    const fechaFin = moment.utc(fecha_fin).format("YYYY:MM:DD");

    const usuarios = await this.usuarioRepository.find(filter);
    const userIds = usuarios.map(item => item.id);

    const timeposList = await this.tiempoRepository.find({
      where: {
        usuario_id: {
          inq: userIds
        },
      },
    });

    const tiemposFiltrados = timeposList.filter(item =>
      moment.utc(item.fecha).format("YYYY:MM:DD") >= fechaInicio && moment.utc(item.fecha).format("YYYY:MM:DD") <= fechaFin
    );

    const duration = tiemposFiltrados.map(item => {
      const horaIni = moment(item.hora_inicio, "HH:mm:ss");
      const horaFin = moment(item.hora_fin, "HH:mm:ss");

      const diff = horaFin.diff(horaIni);
      return {
        horasTabajadas: moment.utc(diff).format("HH:mm"),
        usuario_id: item.usuario_id
      }
    })

    const detalleDuration: any[] = [];
    const userIdsList: number[] = [];
    duration.forEach(item => {
      const user = item.usuario_id;
      const indexUser = userIdsList.indexOf(user);
      if (indexUser === -1) {
        detalleDuration.push(item)
        userIdsList.push(user);
      } else {
        let indexDetail = 0;
        let time = '';
        detalleDuration.forEach((el, idx) => {
          if (el.usuario_id === user) {
            indexDetail = idx;
            time = el.horasTabajadas
          }
        })
        time = moment(time, "HH:mm") + moment.utc(item.horasTabajadas, "HH:mm")
        time = moment(time).format("HH:mm");
        detalleDuration.splice(indexDetail, 1)
        detalleDuration.push({ horasTabajadas: time, usuario_id: user })
      }
    })

    const listaUsuarios = usuarios.map(userItem => {
      const idUser = userItem.id;
      let response = {};
      detalleDuration.forEach(dur => {
        if (idUser === dur.usuario_id) {
          response = { horasTabajadas: dur.horasTabajadas, nombreUsuario: userItem.nombre }
        }
      })
      if (Object.keys(response).length === 0) {
        response = { horasTrabajadas: 0, nombreUsuario: userItem.nombre }
      }
      return response;
    })

    return {
      statusCode: 200,
      response: {
        listaUsuarios,
      }
    };
  }
}
