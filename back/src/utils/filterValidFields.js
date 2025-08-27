export function filterValidFields(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];

    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result;
}

// export function filterValidFields(obj) {
//   const result = {};
//   for (const key in obj) {
//     const value = obj[key];
//     if (
//       value !== undefined &&
//       value !== null &&
//       (typeof value !== 'string' || value.trim() !== '')
//     ) {
//       result[key] = value;
//     }
//   }
//   return result;
// }
