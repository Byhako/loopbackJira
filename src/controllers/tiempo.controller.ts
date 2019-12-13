/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  post,
  requestBody,
} from '@loopback/rest';
import moment from 'moment-with-locales-es6';

import { TiempoRepository, UsuarioRepository, ProyectoRepository, IssueRepository, TimeBody, TimeBodyMultiple } from '../repositories';
import { Tiempo } from '../models/tiempo.model';
import { TimeBodySpecs, TimeBodySpecsMultiple } from '../spec/tiempo.spec';

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

  noRepeatedItems = (array: number[]) => {
    const set = new Set(array);
    const list: number[] = [];
    set.forEach(item => list.push(item));
    return list;
  };

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
    @param.path.date('fecha_inicio') fecha_inicio: string,
    @param.path.date('fecha_fin') fecha_fin: string,
    // @param.query.object('filter', getFilterSchemaFor(Tiempo)) filter?: Filter<Tiempo>,
  ): Promise<{}> {
    const user = await this.usuarioRepository.findOne({
      where: { id: usuario_id },
    });

    if (user) {
      const dateStart = moment.utc(fecha_inicio);
      const dateEnd = moment.utc(fecha_fin);

      // time of every user
      const users = await this.tiempoRepository.find({
        where: {
          and: [
            { usuario_id },
            { fecha: { gte: dateStart } },
            { fecha: { lte: dateEnd } }
          ]
        },
      });

      let tiempoTotal = moment('00:00:00', "HH:mm:ss");
      const detailsLogs = users.map(item => {
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
      const detailsLogsSum: any[] = [];
      const issuesIds: number[] = [];
      detailsLogs.forEach(item => {
        const issue = item.issue_id;
        const indexIssue = issuesIds.indexOf(issue);
        if (indexIssue === -1) {
          detailsLogsSum.push(item)
          issuesIds.push(issue);
        } else {
          let indexDetail = 0;
          let time = '';
          detailsLogsSum.forEach((el, idx) => {
            if (el.issue_id === issue) {
              indexDetail = idx;
              time = el.horas_trabajadas
            }
          })
          time = moment(time, "HH:mm") + moment.utc(item.horas_trabajadas, "HH:mm")
          time = moment(time).format("HH:mm");
          detailsLogsSum.splice(indexDetail, 1)
          detailsLogsSum.push({ horas_trabajadas: time, issue_id: issue })
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

      detailsLogsSum.forEach((item, idx) => {
        const issueId = item.issue_id;
        issuesList.forEach(is => {
          if (issueId === is.id) {
            detailsLogsSum[idx].proyecto_id = is.proyecto_id;
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

      const proyectos = detailsLogsSum.map(item => {
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
          user: user.nombre,
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
    @param.path.date('fecha_inicio') fecha_inicio: string,
    @param.path.date('fecha_fin') fecha_fin: string,
  ): Promise<{}> {
    const dateStart = moment.utc(fecha_inicio);
    const dateEnd = moment.utc(fecha_fin);

    const filteredTimes = await this.tiempoRepository.find({
      where: {
        and: [
          { fecha: { gte: dateStart } },
          { fecha: { lte: dateEnd } }
        ]
      },
    });

    const duration = filteredTimes.map(item => {
      const horaIni = moment(item.hora_inicio, "HH:mm:ss");
      const horaFin = moment(item.hora_fin, "HH:mm:ss");

      const diff = horaFin.diff(horaIni);
      return {
        horas_trabajadas: moment.utc(diff).format("HH:mm"),
        usuario_id: item.usuario_id
      }
    })

    const detailDuration: any[] = [];
    const userIdsList: number[] = [];
    duration.forEach(item => {
      const user = item.usuario_id;
      const indexUser = userIdsList.indexOf(user);
      if (indexUser === -1) {
        detailDuration.push(item)
        userIdsList.push(user);
      } else {
        let indexDetail = 0;
        let time = '';
        detailDuration.forEach((el, idx) => {
          if (el.usuario_id === user) {
            indexDetail = idx;
            time = el.horas_trabajadas
          }
        })
        time = moment(time, "HH:mm") + moment.utc(item.horas_trabajadas, "HH:mm")
        time = moment(time).format("HH:mm");
        detailDuration.splice(indexDetail, 1)
        detailDuration.push({ horas_trabajadas: time, usuario_id: user })
      }
    })

    const users = await this.usuarioRepository.find();

    const listaUsuarios = users.map(userItem => {
      const idUser = userItem.id;
      let response = {};
      detailDuration.forEach(dur => {
        if (idUser === dur.usuario_id) {
          response = { horas_trabajadas: dur.horas_trabajadas, nombre_usuario: userItem.nombre }
        }
      })
      if (Object.keys(response).length === 0) {
        response = { horas_trabajadas: 0, nombre_usuario: userItem.nombre }
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

  @post('/tiempos', {
    responses: {
      '200': {
        description: 'Usuario creado correctamente',
      },
    },
  })
  async create(
    @requestBody(TimeBodySpecs)
    timeBody: TimeBody
  ): Promise<{}> {
    const time = new Tiempo({
      ...timeBody
    });

    const existUser = await this.usuarioRepository.findOne({
      where: { id: time.usuario_id },
    });
    const existIssue = await this.issueRepository.findOne({
      where: { id: time.issue_id },
    });

    if (existIssue && existUser) {
      await this.tiempoRepository.create(time);
      return {
        statusCode: 200,
        response: 'The time log has been created',
      }
    }
    return {
      statusCode: 402,
      response: 'The usuario_id or issue_id not exist',
    }
  }

  @post('/tiempos/multiple', {
    responses: {
      '200': {
        description: 'Usuario creado correctamente',
      },
    },
  })
  async createMultiple(
    @requestBody(TimeBodySpecsMultiple)
    timeBody: TimeBodyMultiple
  ): Promise<{}> {
    // get ids to users and issues
    const listUsuariosId: number[] = [];
    const listIssueId: number[] = [];

    timeBody.logs.forEach(item => {
      listUsuariosId.push(item.usuario_id);
      listIssueId.push(item.issue_id);
    });

    // clean the array so you don't have repeated items
    const userId: number[] = this.noRepeatedItems(listUsuariosId);
    const issueId: number[] = this.noRepeatedItems(listIssueId);

    // I verify the existence of users and issues
    const existUsers = await this.usuarioRepository.find({
      where: { id: { inq: userId } }
    });
    const existIssues = await this.issueRepository.find({
      where: { id: { inq: issueId } }
    });


    if (userId.length === existUsers.length && issueId.length === existIssues.length) {
      const listLogs = timeBody.logs.map(item => (
        new Tiempo({ ...item })
      ))
      await this.tiempoRepository.createAll(listLogs);
      return {
        statusCode: 200,
        response: 'the logs were successfully registered'
      }
    }
    return {
      statusCode: 402,
      response: 'issue id or user id incorrect'
    }
  }
}
