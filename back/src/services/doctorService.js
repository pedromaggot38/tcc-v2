import db from '../config/db.js';
import AppError from '../utils/appError.js';

/**
 * Busca uma lista paginada de médicos com base em filtros e ordenação.
 * @param {object} queryOptions - Opções de consulta.
 * @param {object} queryOptions.filters - Filtros para a cláusula 'where' do Prisma.
 * @param {object} queryOptions.orderBy - Objeto de ordenação do Prisma.
 * @param {number} queryOptions.skip - Número de registros a pular (offset).
 * @param {number} queryOptions.limit - Número de registros a retornar (limit).
 * @returns {Promise<object>} Um objeto contendo os médicos e os totais de paginação.
 */
export const getAllDoctorsService = async ({
  filters,
  orderBy,
  skip,
  limit,
}) => {
  const [totalItems, doctors] = await db.$transaction([
    db.doctor.count({ where: { ...filters } }),
    db.doctor.findMany({
      where: { ...filters },
      skip,
      take: limit,
      orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
      include: {
        createdByUser: {
          select: { id: true, username: true, name: true },
        },
        schedules: {
          select: { dayOfWeek: true, startTime: true, endTime: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return { doctors, totalItems, totalPages };
};

/**
 * Cria um novo médico e seus agendamentos associados.
 * @param {object} doctorData - Os dados do médico vindos do corpo da requisição.
 * @param {string} userId - O ID do usuário que está criando o médico.
 * @returns {Promise<object>} O objeto do médico recém-criado.
 */
export const createDoctorService = async (doctorData, userId) => {
  const dataToCreate = {
    ...doctorData,
    createdBy: userId,
    schedules: undefined,
  };

  if (doctorData.schedules && Array.isArray(doctorData.schedules)) {
    dataToCreate.schedules = {
      create: doctorData.schedules.map((schedule) => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    };
  }

  const newDoctor = await db.doctor.create({
    data: dataToCreate,
  });

  return newDoctor;
};

export const getDoctorService = async (doctorId) => {
  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    include: {
      schedules: true,
    },
  });

  if (!doctor) {
    throw new AppError('Médico não encontrado', 404);
  }

  return doctor;
};

export const updateDoctorService = async (doctorId, updateData, userId) => {
  const { schedules, ...doctorData } = updateData;

  const updatedDoctor = await db.$transaction(async (tx) => {
    await tx.doctor.update({
      where: { id: doctorId },
      data: {
        ...doctorData,
        updatedBy: userId,
      },
    });

    if (schedules && Array.isArray(schedules)) {
      await tx.schedule.deleteMany({ where: { doctorId: doctorId } });

      if (schedules.length > 0) {
        await tx.schedule.createMany({
          data: schedules.map((schedule) => ({
            ...schedule,
            doctorId: doctorId,
          })),
        });
      }
    }

    return tx.doctor.findUnique({
      where: { id: doctorId },
      include: { schedules: true },
    });
  });

  return updatedDoctor;
};

/**
 * Alterna a visibilidade de um médico no sistema.
 * @param {number} doctorId - O ID do médico a ser alterado.
 * @returns {Promise<{updatedDoctor: object, newVisibility: boolean}>} Um objeto com o médico atualizado e o novo status de visibilidade.
 * @throws {AppError} Se o médico não for encontrado.
 */
export const toggleVisibilityDoctorService = async (doctorId) => {
  const doctor = await db.doctor.findUnique({ where: { id: doctorId } });

  if (!doctor) {
    throw new AppError('Médico não encontrado', 404);
  }

  const newVisibility = !doctor.visible;

  const updatedDoctor = await db.doctor.update({
    where: { id: doctorId },
    data: { visible: newVisibility },
  });

  return { updatedDoctor, newVisibility };
};

/**
 * Deleta um médico do banco de dados.
 * @param {number} doctorId - O ID do médico a ser deletado.
 * @throws {Prisma.PrismaClientKnownRequestError}
 */
export const deleteDoctorService = async (doctorId) => {
  await db.doctor.delete({ where: { id: doctorId } });
};

// PUBLIC ROUTES SERVICES

export const getAllDoctorsPublicService = async ({
  filters,
  orderBy,
  skip,
  limit,
}) => {
  const whereClause = { visible: true, ...filters };

  const [totalItems, doctors] = await db.$transaction([
    db.doctor.count({ where: whereClause }),
    db.doctor.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: Object.keys(orderBy).length ? orderBy : { name: 'asc' },
      select: {
        id: true,
        name: true,
        specialty: true,
        state: true,
        crm: true,
        schedules: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, doctors, totalPages };
};
