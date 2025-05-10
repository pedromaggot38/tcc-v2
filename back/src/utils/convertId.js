export default function convertId(id) {
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    throw new Error('ID inválido');
  }

  return parsedId;
}
