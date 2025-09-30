export type ErrorResponseType = {
  status?: number;
  message?: string;
};

export type SuccessResponseType = {
  status?: number;
  payload?: string | object | null | object[];
};

export type ResponseType = {
  error: ErrorResponseType | null;
  data: SuccessResponseType | null;
};
