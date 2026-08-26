import { HttpInterceptorFn } from '@angular/common/http';

/*
==============================================================
Auth Interceptor
==============================================================

Attaches the JWT access token (stored in localStorage during
login) to every outgoing HTTP request as a Bearer token, so
individual services don't need to build headers by hand.

If a request already carries its own Authorization header
(none of ours do today) it is left untouched.
==============================================================
*/

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  if (!token || req.headers.has('Authorization')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);

};
