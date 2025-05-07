export const resfc = (
  res,
  code,
  data = null,
  message = null,
  results = null,
) => {
  const resBody = {
    status: 'success',
  };

  if (message) resBody.message = message;
  if (results !== null) resBody.results = results;
  if (data && Object.keys(data).length > 0) resBody.data = data;

  res.status(code).json(resBody);
};

/* -----  Exemplos  -----------
 resfc(res, 200, { articles }, null, articles.length);
 resfc(res, 200, null, 'Usuário apagado com sucesso');

{
  "status": "success",
  "results": 6,
  "data": {
      "articles": []
  }
  "message": "Usuário apagado com sucesso'"
}
  */
