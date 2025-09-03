import {
  createDoctorService,
  deleteDoctorService,
  getAllDoctorsService,
  getDoctorService,
  toggleVisibilityDoctorService,
  updateDoctorService,
} from '../../services/doctorService.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import convertId from '../../utils/convertId.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';

export const getAllDoctors = catchAsync(async (req, res, next) => {
  const validFilterFields = ['name', 'specialty', 'crm'];
  const validSortFields = ['createdAt', 'name', 'active'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const { doctors, totalItems, totalPages } = await getAllDoctorsService({
    filters,
    orderBy,
    skip,
    limit,
  });

  resfc(res, 200, {
    doctors,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
    },
  });
});

export const createDoctor = catchAsync(async (req, res, next) => {
  const doctorData = req.body;
  const userId = req.user.id;

  const newDoctor = await createDoctorService(doctorData, userId);

  resfc(res, 201, { doctor: newDoctor });
});

export const getDoctor = catchAsync(async (req, res, next) => {
  const doctorId = convertId(req.params.id);

  if (!doctorId) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }

  const doctor = await getDoctorService(doctorId);

  resfc(res, 200, { doctor });
});

export const updateDoctor = catchAsync(async (req, res, next) => {
  const doctorId = convertId(req.params.id);

  if (!doctorId) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }

  const updateData = req.body;
  const userId = req.user.id;

  const updatedDoctor = await updateDoctorService(doctorId, updateData, userId);

  resfc(res, 200, { doctor: updatedDoctor }, 'Médico atualizado com sucesso.');
});

export const toggleVisibilityDoctor = catchAsync(async (req, res, next) => {
  const doctorId = convertId(req.params.id);

  if (!doctorId) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }

  const { updatedDoctor, visible } =
    await toggleVisibilityDoctorService(doctorId);

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
  const doctorId = convertId(req.params.id);

  if (!doctorId) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }

  await deleteDoctorService(doctorId);

  resfc(res, 204);
});
