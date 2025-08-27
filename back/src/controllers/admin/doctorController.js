import db from '../../config/db.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import convertId from '../../utils/convertId.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';

export const getAllDoctors = catchAsync(async (req, res, next) => {
  const validFilterFields = ['name', 'specialty', 'crm'];
  const validSortFields = ['createdAt', 'name', 'active'];

  const { skip, limit, orderBy, filters } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const doctors = await db.doctor.findMany({
    where: { ...filters },
    skip,
    take: limit,
    orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
    include: {
      createdByUser: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      schedules: {
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  resfc(res, 200, { doctors }, null, doctors.length);
});

export const createDoctor = catchAsync(async (req, res, next) => {
  const data = {
    ...req.body,
    createdBy: req.user.id,
    schedules: req.body.schedules
      ? {
          create: req.body.schedules.map((schedule) => ({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          })),
        }
      : [],
  };

  const newDoctor = await db.doctor.create({ data });
  resfc(res, 201, { doctor: newDoctor });
});

export const getDoctor = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const doctor = await db.doctor.findUnique({
    where: { id },
    include: {
      schedules: true,
    },
  });

  if (!doctor) {
    return next(new AppError('Médico não encontrado'));
  }

  resfc(res, 200, { doctor });
});

export const updateDoctor = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);
  const { schedules, ...doctorData } = req.body;

  const doctor = await db.doctor.findUnique({ where: { id } });
  if (!doctor) {
    return next(new AppError('Médico não encontrado', 404));
  }

  const updatedDoctor = await db.$transaction(async (tx) => {
    const updated = await tx.doctor.update({
      where: { id },
      data: {
        ...doctorData,
        updatedBy: req.user.id,
      },
    });

    if (schedules && schedules.length > 0) {
      await tx.schedule.deleteMany({ where: { doctorId: id } });
      await tx.schedule.createMany({
        data: schedules.map((schedule) => ({ ...schedule, doctorId: id })),
      });
    }
    return updated;
  });

  resfc(res, 200, { doctor: updatedDoctor }, 'Médico atualizado com sucesso.');
});

export const toggleVisibilityDoctor = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const doctor = await db.doctor.findUnique({ where: { id } });

  if (!doctor) {
    return next(new AppError('Nenhum médico encontrado', 404));
  }

  let visible;

  switch (doctor.visible) {
    case true:
      visible = false;
      break;
    case false:
      visible = true;
      break;
    default:
      return next(
        new AppError('Erro ao tentar alterar a visibilidade do médico', 500),
      );
  }
  const updatedDoctor = await db.doctor.update({
    where: { id },
    data: { visible },
  });

  resfc(
    res,
    200,
    { doctor: updatedDoctor },
    visible === true
      ? 'Médico agora está visível'
      : 'Médico não está mais visível',
  );
});

export const deleteDoctor = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const doctor = await db.doctor.findUnique({ where: { id } });

  if (!doctor) {
    return next(new AppError('Médico não encontrado'));
  }

  await db.doctor.delete({ where: { id } });

  resfc(res, 204);
});
