export const parseQueryParams = (
  query,
  validFilterFields = [],
  validSortFields = [],
) => {
  const MAX_LIMIT = 100;

  const page = Math.max(parseInt(query.page) || 1, 1);
  const rawLimit = parseInt(query.limit);
  const limit = rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : 10;
  const skip = (page - 1) * limit;

  const orderBy = {};
  if (query.sort && typeof query.sort === 'string') {
    const [field, direction] = query.sort.split(';');
    if (field && direction && validSortFields.includes(field)) {
      orderBy[field] = direction === 'asc' ? 'asc' : 'desc';
    }
  }

  const filters = {};
  if (query.filter && typeof query.filter === 'string') {
    const filterParams = query.filter.split(',');
    filterParams.forEach((filter) => {
      const [field, operatorValue] = filter.split(':');
      if (field && operatorValue && validFilterFields.includes(field)) {
        const [operator, value] = operatorValue.split('[');
        const cleanValue = value ? value.replace(']', '') : value;

        if (operator && cleanValue) {
          switch (operator) {
            case 'gt':
              filters[field] = { gt: cleanValue };
              break;
            case 'lt':
              filters[field] = { lt: cleanValue };
              break;
            case 'gte':
              filters[field] = { gte: cleanValue };
              break;
            case 'lte':
              filters[field] = { lte: cleanValue };
              break;
            case 'neq':
              filters[field] = { not: cleanValue };
              break;
            case 'like':
            case 'contains':
              filters[field] = { contains: cleanValue, mode: 'insensitive' };
              break;
            case 'eq':
              filters[field] = { equals: cleanValue };
              break;
            default:
              break;
          }
        }
      }
    });
  }

  return { page, limit, skip, orderBy, filters };
};
